import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import styles from './Auth.module.css'; // Reusing form styles

const CreateProject = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    motto: '',
    domain: '',
    tags: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      };
      
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/projects', submitData, config);
      
      navigate(`/project/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer} style={{ minHeight: 'auto', paddingTop: '2rem' }}>
      <div className={`${styles.authCard} card`} style={{ maxWidth: '600px' }}>
        <h1 className={styles.title}>Create New Project</h1>
        <p className={styles.subtitle}>Set up a new space for your idea.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Project Name *</label>
            <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Motto / Catchphrase</label>
            <input type="text" name="motto" className="input-field" value={formData.motto} onChange={handleChange} />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Description *</label>
            <textarea name="description" className="input-field" rows="4" value={formData.description} onChange={handleChange} required></textarea>
          </div>
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Domain (e.g., Web3, Healthcare)</label>
              <input type="text" name="domain" className="input-field" value={formData.domain} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Tags (comma separated)</label>
              <input type="text" name="tags" className="input-field" value={formData.tags} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="isPublic" id="isPublic" checked={formData.isPublic} onChange={handleChange} />
            <label htmlFor="isPublic" style={{ cursor: 'pointer' }}>Make project public (discoverable by others)</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%', marginTop: '1rem'}}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
