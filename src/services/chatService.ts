import { FetchEndpoint } from "../view/FetchEndpoint";

// Get all chats for current user
export const getChats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await FetchEndpoint('/chat/chats', 'GET', token, null);
        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
};

// Get specific chat with messages
export const getChatById = async (chatId: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await FetchEndpoint(`/chat/chats/${chatId}`, 'GET', token, null);
        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching chat ${chatId}:`, error);
        throw error;
    }
};

// Send a message
export const sendMessage = async (chatId: string, message: string, messageType = 'TEXT') => {
    try {
        const token = localStorage.getItem('token');
        const response = await FetchEndpoint(
            `/chat/chats/${chatId}/messages`,
            'POST',
            token,
            { message, messageType }
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Interface for file upload response
interface AttachmentResponse {
    data: {
        message_id: string;
        sender_id: string;
        is_recruiter: boolean;
        content: string;
        message_type: string;
        timestamp: string;
        status: string;
        attachment: {
            id: string;
            filename: string;
            file_size: number;
            mime_type: string;
        };
    };
    message: string;
}

// Function to send an attachment
export const sendAttachment = async (chatId: string, file: File): Promise<AttachmentResponse> => {
    try {
        const token = localStorage.getItem('token');

        // For file uploads, we need to use FormData
        // If FetchEndpoint doesn't support FormData directly, you'll need to modify it
        const formData = new FormData();
        formData.append('file', file);

        // Note: Using FetchEndpoint for file uploads - make sure it handles FormData correctly
        const response = await FetchEndpoint(
            `/chat/chats/${chatId}/attachment`,
            'POST',
            token,
            formData
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch chats: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending attachment:', error);
        throw error;
    }
};