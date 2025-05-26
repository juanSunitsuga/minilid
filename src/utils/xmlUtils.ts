import * as fs from 'fs-extra';
import * as path from 'path';
import { parseString, Builder } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);
const builder = new Builder();

// Base directory for chat XML files
const CHATS_DIR = path.join(__dirname, '../../data/chats');

// Ensure the chats directory exists
fs.ensureDirSync(CHATS_DIR);

export interface MessageData {
  message_id: string;
  sender_id: string;
  is_recruiter: boolean;
  content: string;
  message_type: string;
  timestamp: string;
  status: string;
}

export interface ChatData {
  chat_id: string;
  job_application_id: string;
  applier_id: string;
  applier_name?: string;
  recruiter_id: string;
  recruiter_name?: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
  messages: MessageData[];
}

// Get chat file path
export const getChatFilePath = (chatId: string): string => {
  return path.join(CHATS_DIR, `chat_${chatId}.xml`);
};

// Create new chat XML file
export const createChatXml = async (chatData: ChatData): Promise<void> => {
  const xml = builder.buildObject({
    chat: {
      $: { id: chatData.chat_id },
      job_application_id: chatData.job_application_id,
      applier_id: chatData.applier_id,
      applier_name: chatData.applier_name || '',
      recruiter_id: chatData.recruiter_id,
      recruiter_name: chatData.recruiter_name || '',
      last_message: chatData.last_message || '',
      created_at: chatData.created_at,
      updated_at: chatData.updated_at,
      messages: {
        message: chatData.messages.map(msg => ({
          $: { id: msg.message_id },
          sender_id: msg.sender_id,
          is_recruiter: msg.is_recruiter.toString(),
          content: msg.content,
          message_type: msg.message_type,
          timestamp: msg.timestamp,
          status: msg.status
        }))
      }
    }
  });

  await fs.writeFile(getChatFilePath(chatData.chat_id), xml);
};

// Read chat from XML file
export const readChatXml = async (chatId: string): Promise<ChatData | null> => {
  const filePath = getChatFilePath(chatId);
  
  if (!await fs.pathExists(filePath)) {
    return null;
  }
  
  const xml = await fs.readFile(filePath, 'utf-8');
  const result: any = await parseXml(xml);
  
  if (!result.chat) {
    return null;
  }
  
  const chat = result.chat;
  
  return {
    chat_id: chat.$.id,
    job_application_id: chat.job_application_id[0],
    applier_id: chat.applier_id[0],
    applier_name: chat.applier_name?.[0] || '',
    recruiter_id: chat.recruiter_id[0],
    recruiter_name: chat.recruiter_name?.[0] || '',
    last_message: chat.last_message?.[0] || '',
    created_at: chat.created_at[0],
    updated_at: chat.updated_at[0],
    messages: chat.messages?.[0]?.message?.map((msg: any) => ({
      message_id: msg.$.id,
      sender_id: msg.sender_id[0],
      is_recruiter: msg.is_recruiter[0] === 'true',
      content: msg.content[0],
      message_type: msg.message_type[0],
      timestamp: msg.timestamp[0],
      status: msg.status[0]
    })) || []
  };
};

// Add message to existing chat
export const addMessageToChat = async (
  chatId: string, 
  messageData: MessageData
): Promise<void> => {
  const filePath = getChatFilePath(chatId);
  
  if (!await fs.pathExists(filePath)) {
    throw new Error(`Chat file not found: ${chatId}`);
  }
  
  const chat = await readChatXml(chatId);
  if (!chat) {
    throw new Error(`Failed to parse chat: ${chatId}`);
  }
  
  // Add new message
  chat.messages.push(messageData);
  
  // Update last message and timestamp
  chat.last_message = messageData.content;
  chat.updated_at = new Date().toISOString();
  
  // Write updated chat back to file
  await createChatXml(chat);
};

// List all chats
export const listAllChats = async (): Promise<string[]> => {
  const files = await fs.readdir(CHATS_DIR);
  return files
    .filter(file => file.startsWith('chat_') && file.endsWith('.xml'))
    .map(file => file.replace('chat_', '').replace('.xml', ''));
};

// Get chats for user
export const getChatsForUser = async (
  userId: string, 
  isRecruiter: boolean
): Promise<ChatData[]> => {
  const chatIds = await listAllChats();
  const chats: ChatData[] = [];
  
  for (const chatId of chatIds) {
    const chat = await readChatXml(chatId);
    if (chat) {
      if (
        (isRecruiter && chat.recruiter_id === userId) ||
        (!isRecruiter && chat.applier_id === userId)
      ) {
        chats.push(chat);
      }
    }
  }
  
  // Sort by updated_at (newest first)
  return chats.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
};

// Create a chat index file to quickly find chats by application ID
export const updateChatIndex = async (): Promise<void> => {
  const chatIds = await listAllChats();
  const index: Record<string, string> = {};
  
  for (const chatId of chatIds) {
    const chat = await readChatXml(chatId);
    if (chat) {
      index[chat.job_application_id] = chatId;
    }
  }
  
  await fs.writeJson(path.join(CHATS_DIR, 'chat_index.json'), index);
};

// Find chat by application ID
export const findChatByApplicationId = async (applicationId: string): Promise<string | null> => {
  try {
    const indexPath = path.join(CHATS_DIR, 'chat_index.json');
    if (await fs.pathExists(indexPath)) {
      const index = await fs.readJson(indexPath);
      return index[applicationId] || null;
    }
    return null;
  } catch (error) {
    console.error('Error finding chat by application ID:', error);
    return null;
  }
};