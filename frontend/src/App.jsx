// App.jsx – FĂRĂ BrowserRouter aici!
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import DashboardAlergator from "./pages/DashboardAlergator";
import DashboardFotograf from "./pages/DashboardFotograf";
import Login from "./components/Login";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard-alergator" element={<DashboardAlergator />} />
      <Route path="/dashboard-fotograf" element={<DashboardFotograf />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
