import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiFolder, FiUsers } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/projects', config);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProjects();
  }, [user]);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className={styles.subtitle}>Here is what's happening with your projects today.</p>
        </div>
        <Link to="/project/new" className="btn btn-primary">
          <FiPlus /> New Project
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className="card">
          <div className={styles.statIcon}><FiFolder /></div>
          <h3>{projects.length}</h3>
          <p>Active Projects</p>
        </div>
        <div className="card">
          <div className={styles.statIcon} style={{ background: 'var(--success-color)' }}><FiUsers /></div>
          <h3>0</h3>
          <p>Team Members</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Your Projects</h2>
      
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><FiFolder /></div>
          <h3>No projects yet</h3>
          <p>Create a new project to start collaborating with your team.</p>
          <Link to="/project/new" className="btn btn-primary"><FiPlus /> Create Project</Link>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map(project => (
            <div key={project._id} className={`${styles.projectCard} card`}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <span className={styles.badge}>{project.isPublic ? 'Public' : 'Private'}</span>
              </div>
              <p className={styles.projectDesc}>{project.description}</p>
              
              <div className={styles.tags}>
                {project.tags?.map((tag, i) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </div>
              
              <div className={styles.projectFooter}>
                <div className={styles.members}>
                  <FiUsers /> {project.members?.length || 1} Members
                </div>
                <Link to={`/project/${project._id}`} className="btn btn-secondary">Open</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
