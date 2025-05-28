import { FetchEndpoint } from "../view/FetchEndpoint";
import { uploadEndpoint } from '../view/UploadEndpoint';

// Get all chats for current user
export const getChats = async () => {
  try {
    const token = localStorage.getItem('accessToken');
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
export const getChatById = async (chatId: string): Promise<any> => {
  try {
    console.log("Getting chat with ID:", chatId);
    const token = localStorage.getItem('accessToken');

    if (!chatId || chatId === 'undefined') {
      throw new Error("Invalid chat ID");
    }

    const response = await fetch(`http://localhost:3000/chat/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load chat');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (chatId: string, message: string, messageType = 'TEXT') => {
  try {
    const token = localStorage.getItem('accessToken');;
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
    const token = localStorage.getItem('accessToken') || '';
    const formData = new FormData();
    formData.append('file', file);

    // Use uploadEndpoint utility instead of direct fetch
    const response = await uploadEndpoint(
      `/chat/chats/${chatId}/attachment`,
      token,
      formData
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Server returned ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error sending attachment:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// Send an interview request
export const sendInterviewRequest = async (
  chatId: string,
  interviewData: any,
  jobId?: string
): Promise<any> => {
  try {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const isRecruiter = localStorage.getItem('userType') === 'recruiter';

    const response = await FetchEndpoint(
      `/chat/chats/${chatId}/interview`,
      'POST',
      token,
      {
        content: JSON.stringify(interviewData),
        message_type: 'INTERVIEW_REQUEST',
        sender_id: userId,
        is_recruiter: isRecruiter,
        job_id: jobId // Optional job_id if you want to create a full interview schedule
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send interview request');
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending interview request:", error);
    throw error;
  }
};

// Update message status (used for interview responses)
export const updateMessageStatus = async (
  messageId: string,
  updatedContent: string
): Promise<any> => {
  try {
    const token = localStorage.getItem('accessToken');

    const response = await FetchEndpoint(
      `/chat/messages/${messageId}`,
      'PATCH',
      token,
      {
        content: updatedContent,
        status: 'UPDATED'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update interview status');
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
};

// Get interview schedules for current user
export const getInterviews = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') || 'applier';

    const response = await FetchEndpoint(
      `/interviews/user/${userType}/${userId}`,
      'GET',
      token,
      null
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch interviews');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }
};