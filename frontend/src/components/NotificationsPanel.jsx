import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FiCheck, FiX } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import styles from './Navbar.module.css'; // Reusing some dropdown styles

const NotificationsPanel = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/requests', config);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleRespond = async (requestId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/requests/${requestId}`, { action }, config);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    }
  };

  return (
    <div className={styles.dropdown} style={{ right: 0, width: '300px', padding: '1rem', cursor: 'default' }}>
      <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notifications</h4>
      {requests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No new notifications.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.875rem' }}>
                {req.type === 'Invite' 
                  ? `${req.sender.name} invited you to join ${req.receiverProject.name}`
                  : `${req.sender.name} wants to join ${req.receiverProject.name}`
                }
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRespond(req._id, 'Accept')}><FiCheck /> Accept</button>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRespond(req._id, 'Reject')}><FiX /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
