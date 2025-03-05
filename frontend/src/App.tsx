import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Lab from "./pages/Lab/Lab";
import Members from "./pages/Members/Members";  
import Publications from "./pages/Publications/Publications";
import Participation from "./pages/Participation/Participation";
import Inbox from "./pages/Inbox/Inbox";
import AddResearch from "./pages/Research/AddResearch";
import ViewResearch from "./pages/Research/ViewResearch";

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
      </Routes>
    </Router>
  );
};

export default App;