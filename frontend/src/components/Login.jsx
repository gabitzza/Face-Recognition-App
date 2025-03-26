import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegisterForm.css"; // sau un CSS separat

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", formData, {
        headers: { "Content-Type": "application/json" }
      });
  
      const { access_token, user } = res.data;
  
      // ✅ Salvăm token și user în localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
  
      alert("Autentificare reușită!");
  
      // ✅ Redirecționăm în funcție de rol
      if (user.role === "alergator") {
        navigate("/dashboard-alergator");
      } else {
        navigate("/dashboard-fotograf");
      }
  
    } catch (err) {
      alert("Email sau parolă greșită!");
      console.error(err);
    }
  };
  

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="left-panel">
          <h2>Bine ai revenit!</h2>
          <p>Autentifică-te pentru a-ți accesa galeria sau a încărca poze.</p>
        </div>
        <div className="right-panel">
          <h3>Login</h3>
          <form onSubmit={handleSubmit} className="register-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Parolă"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Log In</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
