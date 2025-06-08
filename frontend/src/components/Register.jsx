import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterForm.css";
import '../assets/fonts/fonts.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "alergator",
    gdprAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gdprAccepted) {
      alert("Trebuie să accepți politica de confidențialitate.");
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/register", formData, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Cont creat cu succes! ✅");
      navigate("/login");
    } catch (err) {
      alert("Eroare la înregistrare ❌");
      console.error(err);
    }
  };

  return (
    <div className="login-blur-bg">
      <form className="login-glass-card" onSubmit={handleSubmit}>
        <div className="login-logo">PhotoMatch</div>
        <div className="login-title-glass">Create new account</div>
        <input
          className="login-glass-input"
          type="text"
          name="full_name"
          placeholder="Full name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
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
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          className="login-glass-input"
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{ marginBottom: "1.5rem" }}
        >
          <option value="alergator">Alergător</option>
          <option value="fotograf">Fotograf</option>
        </select>
        <div style={{ marginBottom: "1.2rem", fontSize: "0.97rem" }}>
          <label style={{ color: "#b3e0ff" }}>
            <input
              type="checkbox"
              name="gdprAccepted"
              checked={formData.gdprAccepted}
              onChange={handleChange}
              style={{ marginRight: 8 }}
              required
            />
            Sunt de acord cu{" "}
            <Link to="/politica-confidentialitate" className="login-glass-link">
              Politica de Confidențialitate
            </Link>
          </label>
        </div>
        <button className="login-glass-btn" type="submit">Create account</button>
        <div className="login-glass-links">
          <a href="/login" className="login-glass-link">Ai deja cont? Log in</a>
        </div>
      </form>
    </div>
  );
}

export default Register;
