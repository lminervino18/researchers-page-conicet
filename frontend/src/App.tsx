import React from "react";

const App: React.FC = () => {
  return (
    <div style={{ 
      textAlign: "center", 
      padding: "50px", 
      fontSize: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f0f8ff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ color: "#003366" }}>Researchers Page - CONICET</h1>
      <p style={{ maxWidth: "600px", lineHeight: "1.5" }}>
        Welcome to the official platform where CONICET researchers showcase their work,  
        publications, and contributions to the scientific community.
      </p>
    </div>
  );
};

export default App;
