import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

import CreateProject from './pages/CreateProject';
import ProjectPage from './pages/ProjectPage';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import Discovery from './pages/Discovery';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <Navbar />
                <main className="container" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/discovery" element={<Discovery />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/project/new" element={<CreateProject />} />
                    <Route path="/project/:id" element={<ProjectPage />} />
                    <Route path="/project/:id/workspace" element={<Workspace />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
