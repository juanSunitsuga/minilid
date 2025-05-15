import React, { useState, useEffect } from 'react';
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
  Grow
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Send as SendIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface Message {
  sender: string;
  text: string;
  time: string;
  isRead?: boolean;
}

interface ChatItem {
  id: number;
  name: string;
  title: string;
  lastMessage: string;
  date: string;
  avatar: string;
  messages: Message[];
  unread?: number;
  online?: boolean;
}

const chatData: ChatItem[] = [
  {
    id: 1,
    name: 'Kristen J.',
    title: 'Director of Premium Support @ LinkedIn',
    lastMessage: 'Are you currently exploring new job opportunities?',
    date: 'May 4',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    messages: [
      {
        sender: 'Kristen J.',
        text: 'Hi Aloysius, are you currently exploring new job opportunities?',
        time: '5:43 PM',
        isRead: true
      },
    ],
    unread: 1,
    online: true
  },
  {
    id: 2,
    name: 'Luis M.',
    title: 'Developer',
    lastMessage: 'Okay',
    date: 'Apr 10',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    messages: [
      {
        sender: 'Dionisius Pratama',
        text: 'Okay',
        time: '3:15 PM',
        isRead: true
      },
    ],
    online: false
  },
];

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
  const [selectedChat, setSelectedChat] = useState(chatData[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chatData);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = chatData.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chatData);
    }
  }, [searchQuery]);

  // Send a message function
  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Create a copy of the selected chat to modify
      const updatedChat = {
        ...selectedChat,
        messages: [
          ...selectedChat.messages,
          {
            sender: 'You',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
          }
        ],
        lastMessage: messageText,
        date: 'Just now'
      };
      
      // Update the selected chat
      setSelectedChat(updatedChat);
      
      // Update the chat in the filteredChats array
      const updatedChats = filteredChats.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      );
      setFilteredChats(updatedChats);
      
      // Clear the message input
      setMessageText('');

      // Simulate a reply after 2 seconds
      setTimeout(() => {
        const replyMessage = {
          sender: selectedChat.name,
          text: `Thanks for your message. I'll get back to you shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        
        const chatWithReply = {
          ...updatedChat,
          messages: [...updatedChat.messages, replyMessage],
          lastMessage: replyMessage.text,
          date: 'Just now'
        };
        
        setSelectedChat(chatWithReply);
        
        const chatsWithReply = filteredChats.map(chat => 
          chat.id === selectedChat.id ? chatWithReply : chat
        );
        setFilteredChats(chatsWithReply);
      }, 2000);
    }
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
            {filteredChats.length > 0 ? filteredChats.map((chat, index) => (
              <Fade in={true} key={chat.id} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                <Box>
                  <ChatListItem
                    onClick={() => setSelectedChat(chat)}
                    selected={chat.id === selectedChat.id ? 'true' : 'false'}
                  >
                    <ListItemAvatar>
                      {chat.online ? (
                        <OnlineBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                        >
                          <Avatar src={chat.avatar} alt={chat.name} />
                        </OnlineBadge>
                      ) : (
                        <Avatar src={chat.avatar} alt={chat.name} />
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography 
                            variant="subtitle2" 
                            component="span"
                            sx={{
                              fontWeight: chat.unread ? 600 : 400,
                              color: chat.unread ? 'text.primary' : 'inherit'
                            }}
                          >
                            {chat.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={chat.unread ? "primary" : "text.secondary"}
                            sx={{ fontWeight: chat.unread ? 500 : 400 }}
                          >
                            {chat.date}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ 
                              maxWidth: chat.unread ? 160 : 180,
                              color: chat.unread ? 'text.primary' : 'text.secondary',
                              fontWeight: chat.unread ? 500 : 400,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                          {chat.unread && (
                            <Zoom in={true}>
                              <Badge 
                                badgeContent={chat.unread} 
                                color="primary" 
                                sx={{ ml: 1 }}
                              />
                            </Zoom>
                          )}
                        </Box>
                      }
                    />
                  </ChatListItem>
                  {index < filteredChats.length - 1 && <Divider component="li" />}
                </Box>
              </Fade>
            )) : (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">No conversations found</Typography>
              </Box>
            )}
          </List>
        </ChatListSection>

        <ChatWindowSection elevation={0}>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedChat.online ? (
                <OnlineBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar src={selectedChat.avatar} alt={selectedChat.name} sx={{ mr: 2 }} />
                </OnlineBadge>
              ) : (
                <Avatar src={selectedChat.avatar} alt={selectedChat.name} sx={{ mr: 2 }} />
              )}
              <Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedChat.name}
                  </Typography>
                  {selectedChat.online && (
                    <Typography 
                      variant="caption" 
                      color="success.main" 
                      sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
                    >
                      <CircleIcon sx={{ fontSize: 8, mr: 0.5 }} /> Online
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedChat.title}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="More options">
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </ChatHeader>

          <ChatMessages>
            {selectedChat.messages.map((msg, index) => (
              <Grow 
                in={true} 
                key={index} 
                timeout={300} 
                style={{ transformOrigin: msg.sender === 'You' ? 'right' : 'left' }}
              >
                <ChatBubble ismine={msg.sender === 'You' ? 'true' : 'false'}>
                  {msg.sender !== 'You' && (
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 0.5 }}>
                      {msg.sender}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    {msg.text}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <MessageTime variant="caption">
                      {msg.time}
                    </MessageTime>
                    {msg.sender === 'You' && (
                      <CheckCircleIcon 
                        sx={{ 
                          fontSize: 14, 
                          color: msg.isRead ? 'success.main' : 'text.disabled',
                          marginLeft: '2px'
                        }} 
                      />
                    )}
                  </Box>
                </ChatBubble>
              </Grow>
            ))}
          </ChatMessages>

          <ChatReply>
            <StyledTextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
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
              disabled={!messageText.trim()}
            >
              <SendIcon />
            </SendButton>
          </ChatReply>
        </ChatWindowSection>
      </ChatContainer>
    </Box>
  );
};

export default Chat;