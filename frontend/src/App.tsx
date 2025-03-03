import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import AddResearch from "./pages/Research/AddResearch";
import ViewResearch from "./pages/Research/ViewResearch";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research/add" element={<AddResearch />} />
        <Route path="/research/view/:id" element={<ViewResearch />} />
      </Routes>
    </Router>
  );
};

export default App;