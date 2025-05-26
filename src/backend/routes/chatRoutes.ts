import express from "express";
import { v4 as uuidv4 } from "uuid";
import { JobPosts } from "../../../models/job_posts";
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
            chat?: any;
        }
    }
}

const router = express.Router();

router.get("/chats", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Error("Unauthorized: User ID is required");
    }

    const applier = await Appliers.findOne({ where: { user_id: userId } });
    const recruiter = await Recruiters.findOne({ where: { user_id: userId } });

    let chats;
    if (applier) {
        chats = await Chats.findAll({
            where: { applier_id: applier.applier_id },
            include: [
                {
                    model: JobAppliers,
                    as: "jobApplication",
                    include: [
                        {
                            model: JobPosts,
                            as: "jobPost",
                        }
                    ]
                },
                {
                    model: Recruiters,
                    as: "recruiter",
                    attributes: ["recruiter_id", "name", "profile_picture"]
                }
            ],
            order: [["updated_at", "DESC"]]
        });
    } else if (recruiter) {
        chats = await Chats.findAll({
            where: { recruiter_id: recruiter.recruiter_id },
            include: [
                {
                    model: JobAppliers,
                    as: "jobApplication",
                    include: [
                        {
                            model: JobPosts,
                            as: "jobPost",
                        }
                    ]
                },
                {
                    model: Appliers,
                    as: "applier",
                    attributes: ["applier_id", "name", "profile_picture"]
                }
            ],
            order: [["updated_at", "DESC"]]
        });
    } else {
        throw new Error("Unauthorized: User is neither an applier nor a recruiter");
    }

    const approvedChats = chats.filter(chat =>
        chat.jobApplication && ['interviewing', 'hired'].includes(chat.jobApplication.status)
    );

    return {
        message: "Chats retrieved successfully",
        approvedChats: approvedChats.map(chat => ({
            chat_id: chat.chat_id
        }))
    };
}));

router.get('/chats/:chatId', authMiddleware, chatAccessMiddleware, controllerWrapper(async (req, res) => {
    const chatId = req.params.chatId;

    const chat = req.chat;

    const messages = await Messages.findAll({
        where: { chat_id: chatId },
        order: [["timestamp", "ASC"]],
    });

    return {
        chat: chat.toJSON(),
        messages: messages.map(message => message.toJSON())
    }
}));

router.post("/chats/:chat_id/messages", authMiddleware, chatAccessMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const chatId = req.params.chat_id;
    const { message, messageType = "TEXT" } = req.body;

    if (!message) {
        throw new Error("Message content is required");
    }

    const chat = req.chat;

    const isRecruiter = chat.recruiter_id === userId;

    // Create the message
    const newMessage = await Messages.create({
        chat_id: chatId,
        sender_id: userId,
        is_recruiter: isRecruiter,
        content: message,
        message_type: messageType,
        timestamp: new Date(),
        status: "SENT"
    });

    await Chats.update(
        { last_message: newMessage.content, updated_at: new Date() },
        { where: { chat_id: chatId } }
    );

    return {
        message: "Message sent successfully",
        data: newMessage
    };
}));

router.post("/create-chat", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const { job_application_id } = req.body;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    if (!job_application_id) {
        throw new Error("Job application ID is required");
    }

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

    if (!['interviewing', 'hired'].includes(jobApplication.status)) {
        throw new Error("Chat can only be created for applications with status 'interviewing' or 'hired'");
    }

    const recruiter = await Recruiters.findOne({
        where: { user_id: userId },
        include: [
            {
                model: JobPosts,
                as: "jobPosts",
                where: { job_id: jobApplication.job_id }
            }
        ]
    });

    if (!recruiter) {
        throw new Error("You are not authorized to create this chat");
    }

    const existingChat = await Chats.findOne({
        where: {
            job_application_id: job_application_id,
            applier_id: jobApplication.applier_id,
            recruiter_id: recruiter.recruiter_id
        }
    });

    if (existingChat) {
        return {
            status: "failed",
            message: "Chat already exists",
            data: existingChat
        };
    }

    const newChat = await Chats.create({
        chat_id: uuidv4(),
        job_application_id: job_application_id,
        applier_id: jobApplication.applier_id,
        recruiter_id: recruiter.recruiter_id,
        created_at: new Date(),
        updated_at: new Date()
    });

    return {
        message: "Chat created successfully",
        data: newChat
    };
}));

export default router;