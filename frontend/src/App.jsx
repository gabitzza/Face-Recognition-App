// App.jsx – FĂRĂ BrowserRouter aici!
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import DashboardAlergator from "./pages/DashboardAlergator";
import DashboardFotograf from "./pages/DashboardFotograf";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/dashboard-alergator" element={<DashboardAlergator />} />
      <Route path="/dashboard-fotograf" element={<DashboardFotograf />} />
    </Routes>
  );
}

export default App;
