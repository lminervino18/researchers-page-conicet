import { useNavigate } from "react-router-dom";
import "./styles/Dashboard.css";
import LanguageSelector from "../../components/common/LanguageSelector";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Administration Panel</h1>
        <LanguageSelector />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-buttons">
          <button
            onClick={() => navigate("/admin/publications")}
            className="dashboard-button"
          >
            <span>Publications</span>
          </button>
          <button
            onClick={() => navigate("/admin/analogies")}
            className="dashboard-button"
          >
            <span>Analogies</span>
          </button>
          <button
            onClick={() => navigate("/admin/experiments")}
            className="dashboard-button"
          >
            <span>Experiments</span>
          </button>
          <button
            onClick={() => navigate("/admin/news")}
            className="dashboard-button"
          >
            <span>News</span>
          </button>
          <button
            onClick={() => navigate("/admin/emails")}
            className="dashboard-button"
          >
            <span>Email Management</span>
          </button>
          <button
            onClick={() => navigate("/admin/gallery")}
            className="dashboard-button"
          >
            Lab Gallery
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
