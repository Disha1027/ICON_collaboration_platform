import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.navContainer} container`}>
        <Link to="/dashboard" className={styles.logo}>
          ICON <span className={styles.accent}>Idea-CONnect</span>
        </Link>
        
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search projects, users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <div className={styles.navActions}>
          <div className={styles.profileMenu}>
            <button className={styles.iconBtn}>
              <FiBell />
            </button>
            <NotificationsPanel />
          </div>
          
          <div className={styles.profileMenu}>
            <div className={styles.avatar}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" />
              ) : (
                <FiUser />
              )}
            </div>
            <div className={styles.dropdown}>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
