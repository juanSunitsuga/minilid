import React, { useState, useEffect, useRef } from 'react';
import { parseISO, format, isToday, isYesterday } from 'date-fns';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  Button,
  styled,
  Badge,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Grow,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { getChats, getChatById, sendMessage, sendAttachment } from '../services/chatService';

// Types for API responses
interface Message {
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

interface ChatItem {
  chat_id: string;
  applier_id: string;
  applier_name: string;
  recruiter_id: string;
  recruiter_name: string;
  last_message?: string;
  updated_at: string;
  messages?: Message[];
}

// Define or update your AttachmentResponse interface
interface AttachmentResponse {
  data: Message;
  // Add other properties if needed
  success?: boolean;
  message?: string;
}

// Styled components with enhanced visuals
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '1000px', // Fixed width
  height: '600px', // Fixed height
  margin: '20px auto', // Center the container
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
}));

const ChatListSection = styled(Paper)(({ theme }) => ({
  width: '30%',
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'light'
    ? '#f8f9fa'
    : theme.palette.background.paper,
}));

const ChatWindowSection = styled(Paper)(({ theme }) => ({
  width: '70%',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.background.default,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: theme.palette.background.paper,
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(180deg, rgba(240,242,245,0.6) 0%, rgba(240,242,245,0.9) 100%)'
    : theme.palette.background.default,
}));

const ChatBubble = styled(Box)<{ ismine?: string }>(({ theme, ismine }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  borderRadius: ismine === 'true'
    ? theme.shape.borderRadius * 2 + ' ' + theme.shape.borderRadius * 2 + ' 4px ' + theme.shape.borderRadius * 2
    : theme.shape.borderRadius * 2 + ' ' + theme.shape.borderRadius * 2 + ' ' + theme.shape.borderRadius * 2 + ' 4px',
  marginBottom: theme.spacing(2),
  background: ismine === 'true'
    ? theme.palette.primary.main
    : theme.palette.mode === 'light' ? '#ffffff' : theme.palette.action.hover,
  color: ismine === 'true'
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  alignSelf: ismine === 'true' ? 'flex-end' : 'flex-start',
  boxShadow: ismine === 'true'
    ? 'none'
    : '0 2px 5px rgba(0,0,0,0.05)',
  position: 'relative',
  wordBreak: 'break-word',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
  }
}));

const ChatReply = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
  opacity: 0.8,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    }
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.action.hover,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.action.focus,
      boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
    }
  }
}));

const ChatListItem = styled(ListItem)<{ selected?: string }>(({ theme, selected }) => ({
  padding: theme.spacing(1.5, 2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderLeft: selected === 'true' ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  backgroundColor: selected === 'true'
    ? theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : theme.palette.action.selected
    : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.04)'
      : theme.palette.action.hover
  },
}));

const SendButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  minWidth: '36px',
  padding: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isUserRecruiter, setIsUserRecruiter] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const prevMessagesLength = useRef(0);

  // New state variables for upload feedback
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Format date for chat list
  const formatChatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch (e) {
      return dateString;
    }
  };

  // Check if the current user is a recruiter
  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user') || '{}');
  //   console.log("User data:", user); // Debug user data
  //   setUserId(user.id);
  //   setIsUserRecruiter(user.role === 'recruiter');
  //   console.log("Is user recruiter:", user.role === 'recruiter'); 
  // }, []);

  // Fetch all chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await getChats();

        if (response.data && Array.isArray(response.data)) {
          setChats(response.data);
          setFilteredChats(response.data);

          // If we have chats, select the first one
          if (response.data.length > 0) {
            setSelectedChat(response.data[0]);
          }
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load chats');
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // When a chat is selected, fetch its messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        setLoading(true);
        const response = await getChatById(selectedChat.chat_id);

        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        } else {
          setMessages([]);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat?.chat_id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only auto-scroll in these cases:
    // 1. Initial load (when messages length changes from 0)
    // 2. User sends a new message (we sent a message)
    // 3. User was already at the bottom before new message arrived

    if (messages.length > prevMessagesLength.current && shouldScrollToBottom) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, shouldScrollToBottom]);

  // Add this function to detect scroll position
  const handleMessagesScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // Consider "at bottom" if within 100px of bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isAtBottom);
    }
  };

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = chats.filter(chat =>
        chat.applier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.recruiter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  // Send a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);

      // Get user type directly from localStorage
      const userType = localStorage.getItem('userType');
      const isRecruiter = userType === 'recruiter';

      const response = await sendMessage(
        selectedChat.chat_id,
        messageText
      );

      if (response.data) {
        // Force is_recruiter based on the localStorage value
        const newMessage: Message = {
          ...response.data,
          is_recruiter: isRecruiter
        };

        console.log("Sending message as recruiter:", isRecruiter);
        console.log("New message:", newMessage);

        setMessages(prev => [...prev, newMessage]);

        // Update the chat list with new last message
        const updatedChats = chats.map(chat => {
          if (chat.chat_id === selectedChat.chat_id) {
            return {
              ...chat,
              last_message: messageText,
              updated_at: new Date().toISOString()
            };
          }
          return chat;
        });

        setChats(updatedChats);
        setFilteredChats(updatedChats);

        // Clear the message input
        setMessageText('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Replace your current handleFileUpload function with this improved version
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedChat) {
      console.log("No file selected or no chat selected");
      return;
    }

    const file = event.target.files[0];
    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);

    try {
      setUploadingFile(true);
      setUploadError(null);

      // Determine file type for better UI feedback
      const userType = localStorage.getItem('userType');
      const isRecruiter = userType === 'recruiter';

      console.log("Sending file as:", userType);

      // Call the API to send the attachment
      const response = await sendAttachment(selectedChat.chat_id, file);
      console.log("Upload response:", response);

      if ((response as any).data) {
        const newMessage: Message = {
          ...(response as any).data,
          is_recruiter: isRecruiter
        };

        console.log("New message with attachment:", newMessage);

        // Update messages state with new message
        setMessages(prev => [...prev, newMessage]);

        // Get message type based on file mime type
        let messageTypePrefix = '[FILE]';
        if (file.type.startsWith('image/')) messageTypePrefix = '[IMAGE]';
        if (file.type.startsWith('video/')) messageTypePrefix = '[VIDEO]';

        // Update the chat list with the new message
        const updatedChats = chats.map(chat => {
          if (chat.chat_id === selectedChat.chat_id) {
            return {
              ...chat,
              last_message: `${messageTypePrefix} ${file.name}`,
              updated_at: new Date().toISOString()
            };
          }
          return chat;
        });

        setChats(updatedChats);
        setFilteredChats(updatedChats);
        setUploadSuccess(true);
      }
    } catch (err: any) {
      console.error("File upload error:", err);
      setUploadError(err.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      // Clear the file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add this to improve the sendAttachment function in your services/chatService.ts file
  // if you have access to modify it:

  /*
  export const sendAttachment = async (chatId: string, file: File): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`http://localhost:3000/chat/chats/${chatId}/attachment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }
    
    return response.json();
  };
  */

  // Handle chat selection
  const handleChatSelect = (chat: ChatItem) => {
    setSelectedChat(chat);
    setError(null);
  };

  // Check if a message is from current user
  const isMyMessage = (message: Message) => {
    // Get user type directly from localStorage for consistent results
    const userType = localStorage.getItem('userType');

    console.log(`Message ${message.message_id}: isRecruiter=${message.is_recruiter}, userType=${userType}`);

    // Compare directly against localStorage values for consistency
    if (userType === 'recruiter') {
      return message.is_recruiter === true;
    } else if (userType === 'applier') {
      return message.is_recruiter === false;
    }

    // Fallback to the previous logic if localStorage isn't available
    return (isUserRecruiter && message.is_recruiter) ||
      (!isUserRecruiter && !message.is_recruiter);
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return format(date, 'h:mm a');
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Get display name based on whether user is recruiter or applier
  const getDisplayName = (chat: ChatItem) => {
    // Get user type directly from localStorage for consistent results
    const userType = localStorage.getItem('userType');

    if (userType === 'recruiter') {
      return chat.applier_name; // Show applier name when user is recruiter
    } else {
      return chat.recruiter_name; // Show recruiter name when user is applier
    }
  };

  // Determine which avatar to show
  const getAvatar = (chat: ChatItem) => {
    const name = isUserRecruiter ? chat.applier_name : chat.recruiter_name;
    // Placeholder avatar based on first letter of name
    return name.charAt(0).toUpperCase();
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (selectedChat) {
      interval = setInterval(async () => {
        try {
          const response = await getChatById(selectedChat.chat_id);
          if (response.data && response.data.messages) {
            setMessages(response.data.messages);
          }
        } catch (err) {
          console.error('Error polling for messages:', err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedChat]);

  // Add this function to the Chat component
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = (msg: Message) => {
    const API_URL = 'http://localhost:3000';
    const isCurrentUserMessage = isMyMessage(msg);

    if (msg.message_type === 'TEXT') {
      return (
        <Typography variant="body1">
          {msg.content}
        </Typography>
      );
    } else if (msg.message_type === 'IMAGE' && msg.attachment) {
      const attachmentUrl = `${API_URL}/chat/attachments/${msg.attachment.id}/${encodeURIComponent(msg.attachment.filename)}`;
      console.log("Image attachment URL:", attachmentUrl);
      return (
        <Box>
          <Box sx={{ mt: 1, mb: 1 }}>
            <img
              src={attachmentUrl}
              alt={msg.attachment.filename}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color={isCurrentUserMessage ? "rgba(255, 255, 255, 0.8)" : "text.secondary"}
          >
            {msg.attachment.filename} ({formatFileSize(msg.attachment.file_size)})
          </Typography>
        </Box>
      );
    } else if (msg.message_type === 'FILE' && msg.attachment) {
      const attachmentUrl = `${API_URL}/chat/attachments/${msg.attachment.id}/${encodeURIComponent(msg.attachment.filename)}`;
      const isPdf = msg.attachment.mime_type === 'application/pdf' ||
        msg.attachment.filename.toLowerCase().endsWith('.pdf');

      return (
        <Box>
          {isPdf ? (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                size="small"
                href={attachmentUrl}
                target="_blank"
                sx={{
                  backgroundColor: isCurrentUserMessage ? 'rgba(255, 255, 255, 0.2)' : '#f5f5f5',
                  color: isCurrentUserMessage ? 'white' : 'primary.main',
                  '&:hover': {
                    backgroundColor: isCurrentUserMessage ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0',
                  }
                }}
              >
                View PDF
              </Button>
            </Box>
          ) : (
            <Button
              variant={isCurrentUserMessage ? "contained" : "outlined"}
              startIcon={<FileIcon />}
              size="small"
              href={attachmentUrl}
              target="_blank"
              download={msg.attachment.filename}
              sx={{
                mt: 1,
                mb: 1,
                textTransform: 'none',
                backgroundColor: isCurrentUserMessage ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: isCurrentUserMessage ? 'white' : undefined,
                borderColor: isCurrentUserMessage ? 'rgba(255, 255, 255, 0.5)' : undefined,
                '&:hover': {
                  backgroundColor: isCurrentUserMessage ? 'rgba(255, 255, 255, 0.3)' : undefined,
                }
              }}
            >
              Download {msg.attachment.filename.split('.').pop()?.toUpperCase()}
            </Button>
          )}
          <Typography
            variant="caption"
            display="block"
            color={isCurrentUserMessage ? "rgba(255, 255, 255, 0.8)" : "text.secondary"}
          >
            {msg.attachment.filename} ({formatFileSize(msg.attachment.file_size)})
          </Typography>
        </Box>
      );
    }

    // Fallback for unknown message types
    return (
      <Typography variant="body1">
        {msg.content}
      </Typography>
    );
  };

  return (
    <Box sx={{
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <ChatContainer>
        <ChatListSection elevation={0}>
          <ChatHeader sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="600">Messages</Typography>
            <IconButton size="small">
              <FilterIcon fontSize="small" />
            </IconButton>
          </ChatHeader>

          <Box p={2} sx={{ position: 'relative' }}>
            <SearchField
              variant="outlined"
              placeholder="Search messages"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              sx={{
                transition: 'all 0.3s',
                transform: isSearchFocused ? 'translateY(-2px)' : 'none',
                boxShadow: isSearchFocused ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
              }}
            />
          </Box>

          <List sx={{
            flex: 1,
            overflow: 'auto',
            p: 0,
            '&::-webkit-scrollbar': {
              width: '6px',
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '10px'
            }
          }}>
            {loading && filteredChats.length === 0 ? (
              <Box p={4} textAlign="center">
                <CircularProgress size={30} />
              </Box>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => (
                <Fade in={true} key={chat.chat_id} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Box>
                    <ChatListItem
                      onClick={() => handleChatSelect(chat)}
                      selected={selectedChat?.chat_id === chat.chat_id ? 'true' : 'false'}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {getAvatar(chat)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                              variant="subtitle2"
                              component="span"
                            >
                              {getDisplayName(chat)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatChatDate(chat.updated_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 180,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            {chat.last_message?.startsWith('[IMAGE]') && <ImageIcon fontSize="small" />}
                            {chat.last_message?.startsWith('[VIDEO]') && <VideoIcon fontSize="small" />}
                            {chat.last_message?.startsWith('[FILE]') && <FileIcon fontSize="small" />}
                            {chat.last_message || 'No messages yet'}
                          </Typography>
                        }
                      />
                    </ChatListItem>
                    {index < filteredChats.length - 1 && <Divider component="li" />}
                  </Box>
                </Fade>
              ))
            ) : (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">
                  {error ? 'Error loading chats' : 'No conversations found'}
                </Typography>
                {error && <Typography color="error" variant="caption">{error}</Typography>}
              </Box>
            )}
          </List>
        </ChatListSection>

        <ChatWindowSection elevation={0}>
          {selectedChat ? (
            <>
              <ChatHeader>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2 }}>
                    {getAvatar(selectedChat)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getDisplayName(selectedChat)}
                    </Typography>
                  </Box>
                </Box>
              </ChatHeader>

              <ChatMessages
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((msg, index) => (
                      <Grow
                        in={true}
                        key={msg.message_id}
                        timeout={300}
                        style={{ transformOrigin: isMyMessage(msg) ? 'right' : 'left' }}
                      >
                        <ChatBubble ismine={isMyMessage(msg) ? 'true' : 'false'}>
                          {/* Render message content based on type */}
                          {renderMessageContent(msg)}

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <MessageTime variant="caption">
                              {formatMessageTime(msg.timestamp)}
                            </MessageTime>
                            {isMyMessage(msg) && (
                              <CheckCircleIcon
                                sx={{
                                  fontSize: 14,
                                  color: msg.status === 'READ' ? 'success.main' : 'text.disabled',
                                  marginLeft: '2px'
                                }}
                              />
                            )}
                          </Box>
                        </ChatBubble>
                      </Grow>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="text.secondary">No messages yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Start the conversation by sending a message
                    </Typography>
                  </Box>
                )}
              </ChatMessages>

              <ChatReply>
                {/* Hidden file input */}
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />

                <IconButton
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile || sendingMessage}
                  sx={{ mr: 1 }}
                >
                  {uploadingFile ? <CircularProgress size={24} /> : <AttachFileIcon />}
                </IconButton>

                <StyledTextField
                  fullWidth
                  placeholder="Type your message..."
                  variant="outlined"
                  size="small"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sendingMessage || uploadingFile}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  InputProps={{
                    sx: { pr: 1 }
                  }}
                />

                <SendButton
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={handleSendMessage}
                  disabled={(!messageText.trim() && !uploadingFile) || sendingMessage}
                >
                  {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </SendButton>
              </ChatReply>
            </>
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="h6" color="text.secondary">No chat selected</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select a conversation from the list
              </Typography>
            </Box>
          )}
        </ChatWindowSection>
      </ChatContainer>

      {/* Snackbar for upload feedback */}
      <Snackbar
        open={uploadSuccess}
        autoHideDuration={3000}
        onClose={() => setUploadSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setUploadSuccess(false)} severity="success">
          File uploaded successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!uploadError}
        autoHideDuration={5000}
        onClose={() => setUploadError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setUploadError(null)} severity="error">
          {uploadError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;