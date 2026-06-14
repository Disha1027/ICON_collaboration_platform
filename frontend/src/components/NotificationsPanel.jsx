import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiBell, FiCheckCircle } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import styles from './Navbar.module.css'; // Reusing some dropdown styles

const NotificationsPanel = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchPanelData = useCallback(async () => {
    if (!user) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [{ data: requestData }, { data: notificationData }] = await Promise.all([
        axios.get('http://localhost:5000/api/requests', config),
        axios.get('http://localhost:5000/api/notifications', config)
      ]);
      setRequests(requestData);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  }, [user]);

  useEffect(() => {
    fetchPanelData();

    const intervalId = setInterval(fetchPanelData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchPanelData]);

  const handleRespond = async (requestId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/requests/${requestId}`, { action }, config);
      fetchPanelData();
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    }
  };

  const markAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, config);
      fetchPanelData();
    } catch (error) {
      console.error('Failed to mark notifications read', error);
    }
  };

  const unreadCount = notifications.filter(item => !item.isRead).length;

  return (
    <div className={`${styles.dropdown} ${styles.notificationsDropdown}`}>
      <div className={styles.panelHeader}>
        <div>
          <h4>Notifications</h4>
          <p>{requests.length} request{requests.length === 1 ? '' : 's'} - {unreadCount} unread</p>
        </div>
        {notifications.length > 0 && (
          <button className={styles.panelIconBtn} onClick={markAllRead} title="Mark all read">
            <FiCheckCircle />
          </button>
        )}
      </div>

      <div className={styles.panelSection}>
        <h5>Requests</h5>
        {requests.length === 0 ? (
          <p className={styles.panelEmpty}>No pending requests.</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className={styles.requestItem}>
              <p>
                {req.type === 'Invite' 
                  ? `${req.sender.name} invited you to join ${req.receiverProject.name}`
                  : `${req.sender.name} wants to join ${req.receiverProject.name}`
                }
              </p>
              <div className={styles.requestActions}>
                <button className="btn btn-primary" onClick={() => handleRespond(req._id, 'Accept')}><FiCheck /> Accept</button>
                <button className="btn btn-secondary" onClick={() => handleRespond(req._id, 'Reject')}><FiX /> Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.panelSection}>
        <h5>Updates</h5>
        {notifications.length === 0 ? (
          <p className={styles.panelEmpty}>No updates yet.</p>
        ) : (
          notifications.map(item => (
            <div key={item._id} className={`${styles.notificationItem} ${!item.isRead ? styles.unreadNotification : ''}`}>
              <FiBell />
              <div>
                <p>{item.content}</p>
                <span>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
