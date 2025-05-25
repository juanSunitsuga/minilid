import { Request, Response, NextFunction } from 'express';
import { Chats } from '../../models/chats';
import { JobAppliers } from '../../models/job_applier';
import { middlewareWrapper } from '../utils/middlewareWrapper';

const chatAccessMiddleware = middlewareWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const chatId = req.params.chatId || req.params.chat_id;

        if (!userId) {
            throw new Error('Unauthorized: User ID is required');
        }

        if (!chatId) {
            throw new Error('Chat ID is required');
        }

        const chat = await Chats.findOne({
            where: { chat_id: chatId },
            include: [
                {
                    model: JobAppliers,
                    as: 'jobApplication',
                }
            ]
        });

        if (!chat) {
            throw new Error('Chat not found');
        }

        if (chat.applier_id !== userId && chat.recruiter_id !== userId) {
            throw new Error('Unauthorized: You do not have access to this chat');
        }

        if (!chat.jobApplication || !['interviewing', 'hired'].includes(chat.jobApplication.status)) {
            throw new Error('Chat can only be accessed for applications with status "interviewing" or "hired"');
        }

        req.chat = chat;
        next();

    });
export default chatAccessMiddleware;