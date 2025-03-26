// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Lab from "./pages/Lab/Lab";
import Members from "./pages/Members/Members";  
import Publications from "./pages/Publications/Publications";
import Participation from "./pages/Participation/Participation";
import Inbox from "./pages/Inbox/Inbox";
import AddResearch from "./pages/Admin/Publications/AddResearch";
import EditResearch from "./pages/Admin/Publications/EditResearch";
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import AdminPublications from "./pages/Admin/Publications/AdminPublications";
import AdminAnalogies from "./pages/Admin/Analogies/AdminAnalogies";
import AdminExperiments from "./pages/Admin/Experiments/AdminExperiments";
import AddAnalogy  from "./pages/Admin/Analogies/AddAnalogy";
import EditAnalogy from "./pages/Admin/Analogies/EditAnalogy";
import AdminEmails from "./pages/Admin/Emails/AdminEmails";

// Protected Route Component
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
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/members" element={<Members />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/participation" element={<Participation />} />
        <Route path="/inbox" element={<Inbox />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/publications" 
          element={
            <ProtectedRoute>
              <AdminPublications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/publications/add" 
          element={
            <ProtectedRoute>
              <AddResearch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/publications/edit/:id" 
          element={
            <ProtectedRoute>
              <EditResearch />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analogies" 
          element={
            <ProtectedRoute>
              <AdminAnalogies />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/admin/analogies/add" 
          element={
            <ProtectedRoute>
              <AddAnalogy />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/admin/analogies/edit/:id" 
          element={
            <ProtectedRoute>
              <EditAnalogy />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/experiments" 
          element={
            <ProtectedRoute>
              <AdminExperiments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/emails" 
          element={
            <ProtectedRoute>
              <AdminEmails />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;