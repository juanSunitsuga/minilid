import express from "express";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../../middleware/Auth";
import { controllerWrapper } from "../../utils/controllerWrapper";
import { JobAppliers } from "../../../models/job_applier";
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { Messages } from "../../../models/messages";
import { Chats } from "../../../models/chats";
import { JobAppliers } from "../../../models/job_appliers";
import authMiddleware from "../../middleware/Auth";
import chatAccessMiddleware from "../../middleware/ChatAccess";
import { controllerWrapper } from "../../utils/controllerWrapper";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      chat?: ChatData;
      attachmentId?: string;
    }
  }
}

const router = express.Router();

// Middleware to check chat access
const chatAccessMiddleware = controllerWrapper(async (req, res, next) => {
  const userId = req.user?.id;
  const chatId = req.params.chatId || req.params.chat_id;

  if (!userId) {
    throw new Error("Unauthorized: User ID is required");
  }

  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  // Read chat from JSON
  const chat = await readChatJson(chatId);

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.applier_id !== userId && chat.recruiter_id !== userId) {
    throw new Error("You do not have access to this chat");
  }

  const jobApplication = await JobAppliers.findByPk(chat.job_application_id);
  if (!jobApplication || !['interviewing', 'hired'].includes(jobApplication.status)) {
    throw new Error("Chat is only available after application has been approved for interview or hired");
  }

  req.chat = chat;
  next();
});

router.get("/chats", authMiddleware, controllerWrapper(async (req, res) => {
  console.log("GET /chats - User:", req.user);
  const userId = req.user?.id;

  if (!userId) {
    throw new Error("Unauthorized: User ID is required");
  }

  // Ensure directories exist
  fs.ensureDirSync(CHATS_DIR);
  console.log("Ensured chats directory exists at:", CHATS_DIR);

  // Determine if user is applier or recruiter
  const applier = await Appliers.findOne({ where: { applier_id: userId } });
  const recruiter = await Recruiters.findOne({ where: { recruiter_id: userId } });

  console.log("User type:", {
    isApplier: !!applier,
    applierId: applier?.applier_id,
    isRecruiter: !!recruiter,
    recruiterId: recruiter?.recruiter_id
  });

  // Get chats from JSON files
  let chats = [];
  try {
    if (applier) {
      chats = await getChatsForUser(applier.applier_id, false);
    } else if (recruiter) {
      chats = await getChatsForUser(recruiter.recruiter_id, true);
    } else {
      console.log("User is neither an applier nor a recruiter");
      // Return empty array instead of error
      return {
        message: "No chats found",
        data: []
      };
    }
  } catch (error) {
    console.error("Error getting chats:", error);
    return {
      message: "Error getting chats",
      data: []
    };
  }

  console.log(`Found ${chats.length} chats`);

  // If no chats found, return empty array
  if (chats.length === 0) {
    return {
      message: "No chats found",
      data: []
    };
  }

  // Filter chats to only include those with approved applications
  const approvedChats = [];

  for (const chat of chats) {
    try {
      const jobApplication = await JobAppliers.findByPk(chat.job_application_id);
      if (jobApplication && ['interviewing', 'hired'].includes(jobApplication.status)) {
        approvedChats.push({
          chat_id: chat.chat_id,
          applier_id: chat.applier_id,
          applier_name: chat.applier_name,
          recruiter_id: chat.recruiter_id,
          recruiter_name: chat.recruiter_name,
          last_message: chat.last_message || "",
          updated_at: chat.updated_at
        });
      }
    } catch (err) {
      console.error("Error checking job application:", err);
      // Continue to next chat instead of failing
    }
  }

  return {
    message: "Chats retrieved successfully",
    data: approvedChats
  };
}));

// Get specific chat with messages
router.get('/chats/:chatId', authMiddleware, chatAccessMiddleware, controllerWrapper(async (req, res) => {
  // Chat was loaded in middleware
  const chat = req.chat;

  return {
    message: "Chat retrieved successfully",
    data: chat
  };
}));

// Send message in a chat
router.post("/chats/:chat_id/messages", authMiddleware, chatAccessMiddleware, controllerWrapper(async (req, res) => {
  const userId = req.user?.id;
  const chatId = req.params.chat_id;
  const { message, messageType = "TEXT" } = req.body;

  if (!message) {
    throw new Error("Message content is required");
  }

  const chat = req.chat;
  if (!chat) {
    throw new Error("Chat not found");
  }

  // Determine if sender is recruiter or applier
  const isRecruiter = chat.recruiter_id === userId;

  // Create the new message
  const newMessage: ChatMessage = {
    message_id: uuidv4(),
    sender_id: userId || '',
    is_recruiter: isRecruiter,
    content: message,
    message_type: messageType,
    timestamp: new Date().toISOString(),
    status: "SENT"
  };

  // Add message to JSON file
  await addMessageToChat(chatId, newMessage);

  return {
    message: "Message sent successfully",
    data: newMessage
  };
}));

// Create a new chat
router.post("/create-chat", authMiddleware, controllerWrapper(async (req, res) => {
  const userId = req.user?.id;
  const { job_application_id } = req.body;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!job_application_id) {
    throw new Error("Job application ID is required");
  }

  // Find the job application
  const jobApplication = await JobAppliers.findByPk(job_application_id, {
    include: [
      {
        model: JobPosts,
        as: "jobPost",
      },
      {
        model: Appliers,
        as: "applier",
      }
    ]
  });

  if (!jobApplication) {
    throw new Error("Job application not found");
  }

  // Check if the application status allows chat
  if (!['interviewing', 'hired'].includes(jobApplication.status)) {
    throw new Error("Chat can only be created for applications with status 'interviewing' or 'hired'");
  }

  // Check if user is recruiter for this job post
  const recruiter = await Recruiters.findOne({
    where: { user_id: userId }
  });

  if (!recruiter) {
    throw new Error("You are not authorized to create this chat");
  }

  // Check if chat already exists
  const existingChatId = await findChatByApplicationId(job_application_id);
  if (existingChatId) {
    const existingChat = await readChatJson(existingChatId);
    if (existingChat) {
      return {
        status: "failed",
        message: "Chat already exists",
        data: existingChat
      };
    }
  }

  // Create new chat JSON
  const chatId = uuidv4();
  const newChat: ChatData = {
    chat_id: chatId,
    job_application_id,
    applier_id: String(jobApplication.applier_id),
    applier_name: jobApplication.applier?.name || '',
    recruiter_id: recruiter.recruiter_id,
    recruiter_name: recruiter.name || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: []
  };

  await createChatDocument(newChat);
  return {
    message: "Chat created successfully",
    data: newChat
  };
}));

// Add route for sending message with attachment
router.post("/chats/:chat_id/attachment",
  authMiddleware,
  chatAccessMiddleware,
  uploadAttachment.single('file'),
  controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const chatId = req.params.chat_id;
    const { file } = req;

    if (!userId) {
      throw new Error("Unauthorized: User ID is required");
    }

    if (!file) {
      throw new Error("File is required");
    }

    const chat = req.chat;

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Get file stats
    const stats = await fs.stat(file.path);

    // Determine if sender is recruiter or applier
    const isRecruiter = chat.recruiter_id === userId;

    if (!req.attachmentId) {
      throw new Error("Attachment ID is missing");
    }

    // Add attachment message to JSON
    const newMessage = await addAttachmentMessage(
      chatId,
      userId,
      isRecruiter,
      req.attachmentId,
      file.originalname,
      stats.size,
      file.mimetype
    );

    return {
      message: "File sent successfully",
      data: newMessage
    };
  })
);

// Route for getting attachment
router.get("/attachments/:attachmentId/:filename", authMiddleware, controllerWrapper(async (req, res) => {
  const { attachmentId, filename } = req.params;

  const filePath = path.join(ATTACHMENTS_DIR, attachmentId, filename);

  if (!await fs.pathExists(filePath)) {
    return res.status(404).json({ message: "Attachment not found" });
  }

  res.sendFile(filePath);
}));

export default router;