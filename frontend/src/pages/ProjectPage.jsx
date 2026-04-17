import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiLock, FiGlobe, FiFolder, FiSettings, FiX } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import styles from './ProjectPage.module.css';

const ProjectPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(null);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchProject = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/projects/${id}`, config);
      setProject(data);
      setSettingsForm({
        name: data.name,
        motto: data.motto,
        description: data.description,
        domain: data.domain,
        tags: data.tags.join(', '),
        isPublic: data.isPublic
      });
    } catch (error) {
      console.error('Error fetching project', error);
      navigate('/dashboard'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) fetchProject();
  }, [id, user, navigate]);

  const handleSettingsChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettingsForm({ ...settingsForm, [e.target.name]: value });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...settingsForm,
        tags: settingsForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/projects/${id}`, submitData, config);
      setShowSettings(false);
      fetchProject(); // Reload project data
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to save settings');
    }
  };

  const handleRequestToJoin = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/requests/join', { projectId: id }, config);
      alert('Join request sent!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const searchUsersForInvite = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, config);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users', error);
    }
  };

  const sendInvite = async (targetUserId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/requests/invite', { projectId: id, targetUserId }, config);
      alert('Invite sent!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send invite');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const isMember = project.members.some(m => m.user._id === user._id);
  const isAdmin = project.creator._id === user._id || project.members.some(m => m.user._id === user._id && m.role === 'Admin');

  return (
    <div className={styles.projectPage}>
      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Project Settings</h2>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}><FiX /></button>
            </div>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Name</label>
                <input type="text" name="name" className="input-field" value={settingsForm.name} onChange={handleSettingsChange} required />
              </div>
              <div>
                <label>Motto</label>
                <input type="text" name="motto" className="input-field" value={settingsForm.motto} onChange={handleSettingsChange} />
              </div>
              <div>
                <label>Description</label>
                <textarea name="description" className="input-field" rows="4" value={settingsForm.description} onChange={handleSettingsChange}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Domain</label>
                  <input type="text" name="domain" className="input-field" value={settingsForm.domain} onChange={handleSettingsChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Tags</label>
                  <input type="text" name="tags" className="input-field" value={settingsForm.tags} onChange={handleSettingsChange} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="isPublic" id="isPublic" checked={settingsForm.isPublic} onChange={handleSettingsChange} />
                <label htmlFor="isPublic" style={{ cursor: 'pointer' }}>Public Project</label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Add Member</h2>
              <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}><FiX /></button>
            </div>
            <form onSubmit={searchUsersForInvite} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input type="text" className="input-field" placeholder="Search username or domain..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No users found.</p> : searchResults.map(u => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <p style={{ fontWeight: 500 }}>{u.name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>@{u.username} • {u.domain}</p>
                  </div>
                  <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={() => sendInvite(u._id)}>Invite</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.headerCard} card`}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.motto}>{project.motto}</p>
          </div>
          <div className={styles.visibilityBadge}>
            {project.isPublic ? <><FiGlobe /> Public</> : <><FiLock /> Private</>}
          </div>
        </div>
        
        <p className={styles.description}>{project.description}</p>
        
        <div className={styles.tags}>
          {project.tags.map((tag, i) => (
            <span key={i} className={styles.tag}>{tag}</span>
          ))}
        </div>
        
        <div className={styles.actions}>
          {isMember ? (
            <Link to={`/project/${project._id}/workspace`} className="btn btn-primary">
              <FiFolder /> Enter Workspace
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={handleRequestToJoin}>Request to Join</button>
          )}
          {isAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
              <FiSettings /> Settings
            </button>
          )}
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.emptyState}>
              <p>No recent activity.</p>
            </div>
          </div>
        </div>
        
        <div className={styles.sideColumn}>
          <div className="card">
            <h2 className={styles.sectionTitle}>
              <FiUsers /> Members ({project.members.length})
            </h2>
            <div className={styles.memberList}>
              {project.members.map((member) => (
                <div key={member.user._id} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.memberName}>{member.user.name}</p>
                    <p className={styles.memberRole}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (
              <button className={`btn btn-secondary ${styles.addMemberBtn}`} onClick={() => setShowInviteModal(true)}>
                Add Member
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
