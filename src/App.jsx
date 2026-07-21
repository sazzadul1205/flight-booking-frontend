// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MarkupCommissionManagement from "./pages/MarkupCommissionManagement";
import FlightSearch from "./pages/FlightSearch";
import Layout from "./Layout/Layout";
import Upload from "./pages/uploads";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/search" element={<FlightSearch />} />
          <Route path="/config" element={<MarkupCommissionManagement />} />
          <Route path="/upload" element={<Upload />} />
        </Route>
        <Route path="*" element={<Navigate to="/search" />} />
      </Routes>
    </Router>
  );
};

export default App;
