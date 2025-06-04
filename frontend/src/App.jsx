// App.jsx – FĂRĂ BrowserRouter aici!
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import DashboardAlergator from "./pages/DashboardAlergator";
import DashboardFotograf from "./pages/DashboardFotograf";
import RequireAuth from "./components/RequireAuth";
import Login from "./components/Login";
import GalerieFotograf from "./pages/GalerieFotograf";
import DashboardAdmin from "./pages/DashboardAdmin";
import HomePage from './pages/HomePage';
import './assets/fonts/fonts.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* 🔒 Protejăm dashboard-urile */}
      <Route
        path="/dashboard-alergator"
        element={
          <RequireAuth>
            <DashboardAlergator />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-fotograf"
        element={
          <RequireAuth>
            <DashboardFotograf />
          </RequireAuth>
        }
      />
      <Route path="/galerie-fotograf" element={<GalerieFotograf />} />

      <Route
        path="/dashboard-admin"
        element={
          <RequireAuth>
            <DashboardAdmin />
          </RequireAuth>
        }
      />
     
    </Routes>
  );
}

export default App;
