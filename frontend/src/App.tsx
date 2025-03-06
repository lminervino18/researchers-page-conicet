// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Lab from "./pages/Lab/Lab";
import Members from "./pages/Members/Members";  
import Publications from "./pages/Publications/Publications";
import Participation from "./pages/Participation/Participation";
import Inbox from "./pages/Inbox/Inbox";
import AddResearch from "./pages/Research/AddResearch";
import ViewResearch from "./pages/Research/ViewResearch";
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/members" element={<Members />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/participation" element={<Participation />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/research/add" element={<AddResearch />} />
        <Route path="/research/view/:id" element={<ViewResearch />} />
        
        {/* Rutas de administración */}
        <Route path="/admin/login" element={<Login />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;