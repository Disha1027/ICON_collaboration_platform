import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiFolder, FiUsers, FiCompass } from 'react-icons/fi';
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

  const getUserId = (value) => value?._id || value;
  const isUserProject = (project) => {
    const creatorId = getUserId(project.creator);
    const isCreator = creatorId === user?._id;
    const isMember = project.members?.some(member => getUserId(member.user) === user?._id);
    return isCreator || isMember;
  };

  const myProjects = projects.filter(isUserProject);
  const discoverProjects = projects.filter(project => project.isPublic && !isUserProject(project));

  const ProjectCard = ({ project, actionLabel = 'Open' }) => (
    <div className={`${styles.projectCard} card`}>
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
        <Link to={`/project/${project._id}`} className="btn btn-secondary">{actionLabel}</Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className={styles.subtitle}>Manage your workspaces and find public projects to join.</p>
        </div>
        <Link to="/project/new" className="btn btn-primary">
          <FiPlus /> New Project
        </Link>
      </div>

      <h2 className={styles.sectionTitle}>Your Projects</h2>
      
      {loading ? (
        <p>Loading projects...</p>
      ) : myProjects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><FiFolder /></div>
          <h3>No projects yet</h3>
          <p>Create a new project to start collaborating with your team.</p>
          <Link to="/project/new" className="btn btn-primary"><FiPlus /> Create Project</Link>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {myProjects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Discover Projects</h2>
        <Link to="/discovery" className="btn btn-secondary">
          <FiCompass /> Browse All
        </Link>
      </div>

      {!loading && (
        discoverProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FiCompass /></div>
            <h3>No public projects to discover</h3>
            <p>New public projects from other users will appear here.</p>
          </div>
        ) : (
          <div className={styles.projectGrid}>
            {discoverProjects.slice(0, 6).map(project => (
              <ProjectCard key={project._id} project={project} actionLabel="View" />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Dashboard;
