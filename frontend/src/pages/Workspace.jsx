import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiMessageSquare, FiFileText, FiUpload, FiSend, FiPlus, FiX } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import styles from './Workspace.module.css';

const Workspace = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [workspace, setWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); 
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Note state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // File state
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fetchWorkspace = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/projects/${id}/workspace`, config);
      setWorkspace(data);
    } catch (error) {
      console.error('Error fetching workspace', error);
    }
  };

  useEffect(() => {
    if (user && id) fetchWorkspace();
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;
    
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join_project', id);

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      projectId: id,
      sender: user.username,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/projects/${id}/workspace/notes`, {
        title: noteTitle, content: noteContent
      }, config);
      setNoteTitle('');
      setNoteContent('');
      setShowNoteForm(false);
      fetchWorkspace(); // refresh notes
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      
      // Upload file to server
      const { data: uploadData } = await axios.post('http://localhost:5000/api/upload', formData, config);
      
      // Save resource link to workspace
      await axios.post(`http://localhost:5000/api/projects/${id}/workspace/resources`, {
        name: uploadData.name,
        url: uploadData.url,
        type: uploadData.type
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      fetchWorkspace(); // refresh resources
    } catch (error) {
      console.error('Failed to upload file', error);
      alert('Upload failed. Ensure backend is running and limit is 10MB.');
    } finally {
      setUploading(false);
    }
  };

  if (!workspace) return <div>Loading workspace...</div>;

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.sidebar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'notes' ? styles.active : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FiFileText /> Notes
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'files' ? styles.active : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <FiUpload /> Files
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <FiMessageSquare /> Chat
        </button>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'notes' && (
          <div className={`${styles.contentCard} card`} style={{ overflowY: 'auto' }}>
            <div className={styles.contentHeader}>
              <h2>Shared Notes</h2>
              <button className="btn btn-primary" onClick={() => setShowNoteForm(!showNoteForm)}>
                {showNoteForm ? <FiX /> : <FiPlus />} {showNoteForm ? 'Cancel' : 'New Note'}
              </button>
            </div>
            
            {showNoteForm && (
              <form onSubmit={handleAddNote} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <input type="text" className="input-field" placeholder="Note Title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required style={{ marginBottom: '1rem' }} />
                <textarea className="input-field" placeholder="Note Content" value={noteContent} onChange={e => setNoteContent(e.target.value)} rows="4" style={{ marginBottom: '1rem' }}></textarea>
                <button type="submit" className="btn btn-primary">Save Note</button>
              </form>
            )}

            <div className={styles.notesList}>
              {workspace.notes.length === 0 && !showNoteForm ? (
                <p className={styles.emptyText}>No notes found. Create one!</p>
              ) : (
                workspace.notes.map(note => (
                  <div key={note._id} className={styles.noteItem}>
                    <h3>{note.title}</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    <small>By {note.createdBy?.name || 'Unknown'}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className={`${styles.contentCard} card`}>
            <div className={styles.contentHeader}>
              <h2>Resources & Files</h2>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                <FiUpload /> {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
            <div className={styles.filesList}>
              {workspace.resources.length === 0 ? (
                <p className={styles.emptyText}>No files uploaded yet.</p>
              ) : (
                workspace.resources.map(res => (
                  <div key={res._id} className={styles.fileItem}>
                    <a href={res.url} target="_blank" rel="noreferrer">{res.name}</a>
                    <small>{res.type}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className={`${styles.contentCard} card`} style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div className={styles.chatHeader}>
              <h2>Project Chat</h2>
            </div>
            <div className={styles.chatBody}>
              {messages.map((msg, index) => (
                <div key={index} className={`${styles.message} ${msg.sender === user.username ? styles.myMessage : ''}`}>
                  <span className={styles.msgSender}>{msg.sender}</span>
                  <div className={styles.msgContent}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className={styles.chatInputContainer}>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-field"
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                <FiSend />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
