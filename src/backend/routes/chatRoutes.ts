import express from "express";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../../middleware/Auth";
import { middlewareWrapper } from "../../utils/middlewareWrapper";
import { controllerWrapper } from "../../utils/controllerWrapper";
import { JobAppliers } from "../../../models/job_appliers";
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { JobPosts } from "../../../models/job_posts";
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import multer from 'multer';
import process from 'process';
import { readdirSync } from 'fs';  // Keep native fs separate
import { promises as fs } from 'fs';

const PROJECT_ROOT = process.cwd();
const BASE_DIR = path.join(PROJECT_ROOT, 'data');
const CHATS_DIR = path.join(BASE_DIR, 'chats');
const ATTACHMENTS_DIR = path.join(BASE_DIR, 'attachments');

// Ensure directories exist
fsExtra.ensureDirSync(CHATS_DIR);
fsExtra.ensureDirSync(ATTACHMENTS_DIR);

// Setup attachment storage
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const attachmentId = uuidv4();
    const dir = path.join(ATTACHMENTS_DIR, attachmentId);
    fsExtra.ensureDirSync(dir);
    req.attachmentId = attachmentId; // Store ID for later use
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const uploadAttachment = multer({ storage: attachmentStorage });

// Define interfaces for the chat data
interface ChatMessage {
  message_id: string;
  sender_id: string;
  is_recruiter: boolean;
  content: string;
  message_type: string;
  timestamp: string;
  status: string;
  attachment?: {
    id: string;
    filename: string;
    file_size: number;
    mime_type: string;
  };
}

interface ChatData {
  chat_id: string;
  job_application_id: string;
  applier_id: string;
  applier_name: string;
  recruiter_id: string;
  recruiter_name: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  messages: ChatMessage[];
}

// Get chat file path
const getChatFilePath = (chatId: string): string => {
  return path.join(CHATS_DIR, `chat_${chatId}.json`);
};

// Create a new chat
export const createChatDocument = async (chatData: ChatData): Promise<void> => {
  // Use native fs with manual JSON handling
  await fs.writeFile(
    getChatFilePath(chatData.chat_id),
    JSON.stringify(chatData, null, 2),
    'utf8'
  );
  // Update index for lookup by job application ID
  await updateChatIndex(chatData.job_application_id, chatData.chat_id);
};

// Read chat from JSON file
export const readChatJson = async (chatId: string): Promise<ChatData | null> => {
  const filePath = getChatFilePath(chatId);

  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
};

// Add a text message to a chat
export const addTextMessage = async (chatId: string, userId: string, isRecruiter: boolean, content: string) => {
  const chatPath = getChatFilePath(chatId);

  const fileContent = await fs.readFile(chatPath, 'utf8');
  const chat = JSON.parse(fileContent) as ChatData;

  const messageId = uuidv4();
  const newMessage: ChatMessage = {
    message_id: messageId,
    sender_id: userId,
    is_recruiter: isRecruiter,
    content: content,
    message_type: 'TEXT',
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };

  // Add new message
  if (!chat.messages) {
    chat.messages = [];
  }
  chat.messages.push(newMessage);

  // Update metadata
  chat.updated_at = new Date().toISOString();
  chat.last_message = content;

  // Write back to file
  await fs.writeFile(chatPath, JSON.stringify(chat, null, 2), 'utf8');
  return newMessage;
};

// Add an attachment message
export const addAttachmentMessage = async (
  chatId: string,
  userId: string,
  isRecruiter: boolean,
  attachmentId: string,
  filename: string,
  fileSize: number,
  mimeType: string
) => {
  const chatPath = getChatFilePath(chatId);

  // Use fs.readFile instead of fsExtra.readJSON
  const fileContent = await fs.readFile(chatPath, 'utf8');
  const chat = JSON.parse(fileContent) as ChatData;

  // Rest of the function remains the same
  const messageId = uuidv4();
  let messageType = 'FILE';

  if (mimeType.startsWith('image/')) messageType = 'IMAGE';
  if (mimeType.startsWith('video/')) messageType = 'VIDEO';

  // Code to create message stays the same
  const newMessage: ChatMessage = {
    message_id: messageId,
    sender_id: userId,
    is_recruiter: isRecruiter,
    content: `attachment://${attachmentId}`,
    message_type: messageType,
    timestamp: new Date().toISOString(),
    status: 'SENT',
    attachment: {
      id: attachmentId,
      filename,
      file_size: fileSize,
      mime_type: mimeType
    }
  };

  if (!chat.messages) {
    chat.messages = [];
  }
  chat.messages.push(newMessage);

  chat.updated_at = new Date().toISOString();
  chat.last_message = `[${messageType}] ${filename}`;

  // Use fs.writeFile instead of fsExtra.writeJSON
  await fs.writeFile(chatPath, JSON.stringify(chat, null, 2), 'utf8');

  return newMessage;
};

// Update index for lookup by job application ID
const updateChatIndex = async (applicationId: string, chatId: string) => {
  const indexPath = path.join(CHATS_DIR, 'chat_index.json');
  let index: Record<string, string> = {};

  // Check if file exists using fs promises instead of fsExtra
  try {
    await fs.access(indexPath);
    // If file exists, read it
    const fileContent = await fs.readFile(indexPath, 'utf8');
    index = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist, use empty index object
    console.log("Creating new chat index file");
  }

  index[applicationId] = chatId;

  // Write using fs.writeFile instead of fsExtra.writeJSON
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
};

// Find chat by application ID
export const findChatByApplicationId = async (applicationId: string): Promise<string | null> => {
  try {
    const indexPath = path.join(CHATS_DIR, 'chat_index.json');
    try {
      await fs.access(indexPath);
      const fileContent = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(fileContent);
      return index[applicationId] || null;
    } catch (error) {
      return null;
    }
  } catch (error) {
    console.error('Error finding chat by application ID:', error);
    return null;
  }
};

// Get chats for user
export const getChatsForUser = async (userId: string, isRecruiter: boolean): Promise<ChatData[]> => {
  try {
    // First check if directory exists using fs-extra
    if (!await fsExtra.pathExists(CHATS_DIR)) {
      console.log(`Chat directory doesn't exist: ${CHATS_DIR}`);
      return [];
    }

    // Use Node.js native fs module instead of fs-extra for directory reading
    const files = readdirSync(CHATS_DIR);
    console.log(`Found ${files.length} files in chat directory:`, files);

    const chatIds = files
      .filter(file => file.startsWith('chat_') && file.endsWith('.json'))
      .map(file => file.replace('chat_', '').replace('.json', ''));

    console.log(`Found ${chatIds.length} chat files`);

    const chats: ChatData[] = [];

    for (const chatId of chatIds) {
      try {
        const chat = await readChatJson(chatId);
        if (chat) {
          if ((isRecruiter && chat.recruiter_id === userId) ||
            (!isRecruiter && chat.applier_id === userId)) {
            chats.push(chat);
          }
        }
      } catch (chatError) {
        console.error(`Error reading chat ${chatId}:`, chatError);
      }
    }

    return chats.sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  } catch (error) {
    console.error('Error getting chats for user:', error);
    return [];
  }
};

// Add message to chat
export const addMessageToChat = async (chatId: string, message: ChatMessage): Promise<void> => {
  const chatPath = getChatFilePath(chatId);

  try {
    await fs.access(chatPath);
  } catch (error) {
    throw new Error(`Chat file not found: ${chatId}`);
  }

  // Read file using fs.readFile instead of fsExtra.readJSON
  const fileContent = await fs.readFile(chatPath, 'utf8');
  const chat = JSON.parse(fileContent) as ChatData;

  if (!chat.messages) {
    chat.messages = [];
  }

  chat.messages.push(message);
  chat.updated_at = new Date().toISOString();
  chat.last_message = message.content;

  // Write file using fs.writeFile instead of fsExtra.writeJSON
  await fs.writeFile(chatPath, JSON.stringify(chat, null, 2), 'utf8');
};

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
const chatAccessMiddleware = middlewareWrapper(async (req, res, next) => {
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
  if (!jobApplication || !['interviewing'].includes(jobApplication.status)) {
    throw new Error("Chat is only available after application has been approved for interview or hired");
  }

  req.chat = chat;
});

router.get("/chats", authMiddleware, controllerWrapper(async (req, res) => {
  console.log("GET /chats - User:", req.user);
  const userId = req.user?.id;


  if (!userId) {
    throw new Error("Unauthorized: User ID is required");
  }

  // Ensure directories exist
  fsExtra.ensureDirSync(CHATS_DIR);
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

  console.log("POST /chats/:chat_id/messages - User:", req.user, "Chat ID:", chatId, "Body:", req.body);

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
  try {
    await addMessageToChat(chatId, newMessage);
  } catch (error) {
    console.error("Error adding message to chat:", error);
    throw new Error(`Failed to add message: ${error}`);
  }

  return {
    message: "Message sent successfully",
    data: newMessage
  };
}));

// Create a new chat
router.post("/create-chat", authMiddleware, controllerWrapper(async (req, res) => {
  const userId = req.user?.id;
  const { job_application_id } = req.body;

  console.log("POST /create-chat - User:", req.user, "Body:", req.body);
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

  if (!['interviewing'].includes(jobApplication.status)) {
    throw new Error("Chat can only be created for applications with status 'interviewing' or 'hired'");
  }

  const recruiter = await Recruiters.findOne({
    where: { recruiter_id: userId }
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

  try {
    await createChatDocument(newChat);
    console.log("Chat document created successfully");
  } catch (error) {
    console.error("Error creating chat document:", error);
    throw new Error(`Failed to create chat: ${error}`);
  }

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
router.get("/attachments/:attachmentId/:filename", controllerWrapper(async (req, res) => {
  const { attachmentId, filename } = req.params;
  const filePath = path.join(ATTACHMENTS_DIR, attachmentId, filename);

  if (!await fsExtra.pathExists(filePath)) {
    return res.status(404).json({ message: "Attachment not found" });
  }

  // Set proper content-type based on file extension
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      res.setHeader('Content-Type', 'application/pdf');
      break;
    case '.png':
      res.setHeader('Content-Type', 'image/png');
      break;
    case '.jpg':
    case '.jpeg':
      res.setHeader('Content-Type', 'image/jpeg');
      break;
    case '.gif':
      res.setHeader('Content-Type', 'image/gif');
      break;
    // Add more types as needed
    default:
      // Use a generic content type for unknown file types
      res.setHeader('Content-Type', 'application/octet-stream');
  }

  // Set appropriate caching and disposition
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  res.sendFile(filePath);
}));

export default router;