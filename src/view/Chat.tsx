import React, { useState } from 'react';
import './Chat.css';

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

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(chatData[0]);

  return (
    <div className="chat-page">
      <aside className="chat-list">
        <input type="text" placeholder="Search messages" className="chat-search" />
        {chatData.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === selectedChat.id ? 'active' : ''}`}
            onClick={() => setSelectedChat(chat)}
          >
            <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
            <div className="chat-info">
              <div className="chat-name">{chat.name}</div>
              <div className="chat-preview">{chat.lastMessage}</div>
            </div>
            <div className="chat-date">{chat.date}</div>
          </div>
        ))}
      </aside>

      <section className="chat-window">
        <div className="chat-header">
          <img src={selectedChat.avatar} alt={selectedChat.name} className="chat-avatar" />
          <div>
            <div className="chat-name">{selectedChat.name}</div>
            <div className="chat-title">{selectedChat.title}</div>
          </div>
        </div>
        <div className="chat-messages">
          {selectedChat.messages.map((msg, index) => (
            <div key={index} className="chat-bubble">
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
              <span className="chat-time">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-reply">
          <input type="text" placeholder="Write a message..." />
          <button>Send</button>
        </div>
      </section>
    </div>
  );
};

export default Chat;
