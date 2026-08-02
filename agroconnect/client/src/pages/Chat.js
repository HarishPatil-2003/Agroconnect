import React, { useState, useEffect, useRef } from 'react';
import { Send, File, Image, Check, CheckCheck, Circle, User } from 'lucide-react';
import api, { auth } from '../utils/auth';
import './Chat.css';

const Chat = () => {
  const currentUser = auth.getCurrentUser();
  const token = localStorage.getItem('token');
  const chatBottomRef = useRef(null);

  // States
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Simulations
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentChats();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact._id);
      
      // Simulate typing indicator after choosing a contact
      setTyping(true);
      const timer = setTimeout(() => setTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeContact]);

  useEffect(() => {
    // Scroll to bottom
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const fetchRecentChats = async () => {
    try {
      const res = await api.get('/chats/recent');
      setConversations(res.data);
      if (res.data.length > 0 && !activeContact) {
        setActiveContact(res.data[0].contact);
      }
    } catch (err) {
      console.error('Failed to fetch recent chats:', err);
    }
  };

  const fetchMessages = async (contactId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chats/messages/${contactId}`);
      setMessages(res.data);
      // Mark read
      await api.put(`/chats/read/${contactId}`);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const res = await api.post('/chats/messages', {
        recipientId: activeContact._id,
        text: newMessage
      });

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      
      // Update conversations sidebar list
      fetchRecentChats();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleAttachImage = () => {
    // Simulate attaching an image
    if (!activeContact) return;
    const mockImageMessage = {
      _id: Math.random().toString(),
      sender: currentUser.id,
      recipient: activeContact._id,
      text: 'Shared a photo:',
      attachments: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, mockImageMessage]);
  };

  const handleAttachFile = () => {
    // Simulate attaching a document
    if (!activeContact) return;
    const mockFileMessage = {
      _id: Math.random().toString(),
      sender: currentUser.id,
      recipient: activeContact._id,
      text: 'Shared a document:',
      attachments: ['Crop_Report_AgroConnect.pdf'],
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, mockFileMessage]);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar: Conversations list */}
        <div className="chat-sidebar">
          <div className="chat-sidebar__header">
            <h3>Recent Chats</h3>
          </div>
          <div className="chat-sidebar__list">
            {conversations.length === 0 ? (
              <div className="chat-sidebar__empty">
                <p>No active conversations.</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>You can start a chat directly from product seller detail pages in the Marketplace!</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.contact._id} 
                  className={`chat-contact-item ${activeContact?._id === conv.contact._id ? 'chat-contact-item--active' : ''}`}
                  onClick={() => setActiveContact(conv.contact)}
                >
                  <div className="chat-contact-item__avatar">
                    {conv.contact.profilePicture ? (
                      <img src={conv.contact.profilePicture} alt="" className="chat-contact-item__avatar-img" />
                    ) : (
                      <span className="chat-contact-item__avatar-placeholder">
                        {conv.contact.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="chat-online-indicator" />
                  </div>
                  <div className="chat-contact-item__info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="chat-contact-item__name">{conv.contact.name}</h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="chat-contact-item__last-msg">{conv.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div className="chat-window">
          {activeContact ? (
            <>
              {/* Header */}
              <div className="chat-window__header">
                <div className="chat-window__contact-info">
                  <div className="chat-contact-item__avatar" style={{ width: '40px', height: '40px' }}>
                    {activeContact.profilePicture ? (
                      <img src={activeContact.profilePicture} alt="" className="chat-contact-item__avatar-img" />
                    ) : (
                      <span className="chat-contact-item__avatar-placeholder">
                        {activeContact.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="chat-online-indicator" />
                  </div>
                  <div>
                    <h4 className="chat-window__contact-name">{activeContact.name}</h4>
                    <span className="chat-window__contact-status">Online</span>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="chat-window__messages">
                {messages.map((msg) => {
                  const isOwn = msg.sender === currentUser.id || msg.sender?._id === currentUser.id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`chat-message-bubble ${isOwn ? 'chat-message-bubble--own' : 'chat-message-bubble--incoming'}`}
                    >
                      <div className="chat-message-bubble__content">
                        <p>{msg.text}</p>
                        {msg.attachments && msg.attachments.map((att, idx) => {
                          const isImg = att.startsWith('http') || att.startsWith('data:image');
                          return (
                            <div key={idx} className="chat-attachment">
                              {isImg ? (
                                <img src={att} alt="attachment" className="chat-attachment-img" />
                              ) : (
                                <div className="chat-attachment-file">
                                  <File size={16} />
                                  <span>{att}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div className="chat-message-bubble__meta">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            <span style={{ marginLeft: '4px' }}>
                              {msg.isRead ? <CheckCheck size={12} color="var(--green-primary)" /> : <Check size={12} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="chat-message-bubble chat-message-bubble--incoming">
                    <div className="chat-message-bubble__content chat-typing-bubble">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form className="chat-window__input-bar" onSubmit={handleSendMessage}>
                <button type="button" className="chat-action-btn" onClick={handleAttachImage} title="Share Image">
                  <Image size={18} />
                </button>
                <button type="button" className="chat-action-btn" onClick={handleAttachFile} title="Share Document">
                  <File size={18} />
                </button>
                
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type your message here..." 
                  className="chat-text-input"
                />
                
                <button type="submit" className="chat-send-btn">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-window__empty">
              <User size={48} />
              <h3>No Active Conversations</h3>
              <p>Select a contact from the sidebar or click 'Chat with Farmer' from a Marketplace listing page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
