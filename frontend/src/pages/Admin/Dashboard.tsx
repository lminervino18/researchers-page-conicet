// pages/Admin/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import './styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Administration Panel</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-buttons">
          <button 
            onClick={() => navigate('/admin/publications')} 
            className="dashboard-button"
          >
            Publications
          </button>
          <button 
            onClick={() => navigate('/admin/analogies')} 
            className="dashboard-button"
          >
            Analogies
          </button>
          <button 
            onClick={() => navigate('/admin/experiments')} 
            className="dashboard-button"
          >
            Experiments
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;