// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MarkupCommissionManagement from "./pages/MarkupCommissionManagement";
import Layout from "./Layout/Layout";
import Upload from "./pages/uploads";
import Home from "./pages/Home";
import Search from "./pages/Search";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/config" element={<MarkupCommissionManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
};

export default App;
