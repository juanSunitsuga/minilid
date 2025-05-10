import React, { useState } from 'react';
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
  styled
} from '@mui/material';
import { Search as SearchIcon, Send as SendIcon } from '@mui/icons-material';

interface Message {
  sender: string;
  text: string;
  time: string;
}

interface ChatItem {
  id: number;
  name: string;
  title: string;
  lastMessage: string;
  date: string;
  avatar: string;
  messages: Message[];
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
      },
    ],
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
      },
    ],
  },
];

// Styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 100px)',
  marginTop: 20,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

const ChatListSection = styled(Paper)(({ theme }) => ({
  width: '30%',
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
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
  background: theme.palette.background.paper,
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const ChatBubble = styled(Box)(({ theme }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1.5),
  background: theme.palette.primary.light,
  color: theme.palette.getContrastText(theme.palette.primary.light),
  position: 'relative',
  wordBreak: 'break-word',
}));

const ChatReply = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(chatData[0]);
  const [messageText, setMessageText] = useState('');

  return (
    <ChatContainer>
      <ChatListSection elevation={0}>
        <Box p={2}>
          <TextField
            variant="outlined"
            placeholder="Search messages"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {chatData.map((chat, index) => (
            <React.Fragment key={chat.id}>
              <ListItem
                button
                selected={chat.id === selectedChat.id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  px: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={chat.avatar} alt={chat.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2" component="span">
                        {chat.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {chat.date}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 200 }}
                    >
                      {chat.lastMessage}
                    </Typography>
                  }
                />
              </ListItem>
              {index < chatData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </ChatListSection>

      <ChatWindowSection elevation={0}>
        <ChatHeader>
          <Avatar src={selectedChat.avatar} alt={selectedChat.name} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {selectedChat.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedChat.title}
            </Typography>
          </Box>
        </ChatHeader>

        <ChatMessages>
          {selectedChat.messages.map((msg, index) => (
            <ChatBubble key={index}>
              <Typography variant="subtitle2">{msg.sender}</Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {msg.text}
              </Typography>
              <MessageTime variant="caption">{msg.time}</MessageTime>
            </ChatBubble>
          ))}
        </ChatMessages>

        <ChatReply>
          <TextField
            fullWidth
            placeholder="Write a message..."
            variant="outlined"
            size="small"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            disableElevation
            endIcon={<SendIcon />}
            onClick={() => {
              if (messageText.trim()) {
                // Here you'd normally add the message to the chat
                setMessageText('');
              }
            }}
          >
            Send
          </Button>
        </ChatReply>
      </ChatWindowSection>
    </ChatContainer>
  );
};

export default Chat;
