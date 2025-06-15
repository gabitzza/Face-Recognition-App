import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterForm.css";
import '../assets/fonts/fonts.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" }
      });

      const { access_token, user } = res.data;
      console.log("🔁 Response:", res.data);

      if (!access_token || !user) {
        alert("Login invalid — backend nu a returnat datele așteptate.");
        console.log("Răspuns invalid:", res.data);
        return;
      }
      // ✅ Salvăm token și user în localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Autentificare reușită!");

      // ✅ Redirecționăm în funcție de rol
      if (user.role === "admin") {
        navigate("/dashboard-admin");
      }
      else if (user.role === "alergator") {
        navigate("/dashboard-alergator");
      } else {
        navigate("/dashboard-fotograf");
      }

    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("Contul tău nu a fost încă aprobat de administrator.");
      } else if (err.response) {
        // Server responded with a status code outside the 2xx range
        console.error("Error response:", err.response);
        alert(`Eroare: ${err.response.data.message || "Email sau parolă greșită!"}`);
      } else {
        // Network error or other issues
        console.error("Error message:", err.message);
        alert("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    }
  };

  return (
    <div className="login-blur-bg">
      <form className="login-glass-card" onSubmit={handleSubmit}>
        <div className="login-logo">PhotoMatch</div>
        <div className="login-title-glass">Autentificare în cont</div>
        <input
          className="login-glass-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="login-glass-input"
          type="password"
          name="password"
          placeholder="Parolă"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="login-glass-btn" type="submit">Autentificare</button>
        <div className="login-glass-links">
          <span style={{ color: "#b3e0ff" }}>
            Nu ai cont?{" "}
            <Link to="/register" className="login-glass-link">
              Creează aici
            </Link>
          </span>
          <div style={{ fontSize: "0.85rem", marginTop: 8, color: "#b3e0ff" }}>
            <Link to="/politica-confidentialitate" className="login-glass-link">
              Politica de confidențialitate
            </Link>
            &nbsp;
            <a href="#" className="login-glass-link">Termeni de utilizare</a>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
