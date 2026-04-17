import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './Auth.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    domain: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData, skills: formData.skills.split(',').map(s => s.trim()) };
      await register(submitData);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} card`}>
        <h1 className={styles.title}>Join ICON</h1>
        <p className={styles.subtitle}>Create an account to start collaborating.</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Name</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} required />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
          </div>
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Domain (e.g., AI, Web)</label>
              <input type="text" name="domain" className="input-field" value={formData.domain} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Skills (comma separated)</label>
              <input type="text" name="skills" className="input-field" value={formData.skills} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Sign Up
          </button>
        </form>
        
        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
