// pages/Admin/Experiments/AdminExperiments.tsx
import { useNavigate } from 'react-router-dom';


const AdminExperiments = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="back-button"
        >
          Back to Dashboard
        </button>
        <h1>Experiments Management</h1>
      </header>
      <main className="admin-page-content">
        <div className="coming-soon">COMING SOON</div>
      </main>
    </div>
  );
};

export default AdminExperiments;