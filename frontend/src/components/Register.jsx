import { useState } from "react";
import axios from "axios";
import "./RegisterForm.css";
import '../assets/fonts/fonts.css';
function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "alergator",
    gdprAccepted: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/register", formData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      alert("User registered! ✅");
      console.log(res.data);
    } catch (err) {
      alert("Eroare la înregistrare ❌");
      console.error(err);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="left-panel">
          <h2>Bine ai venit!</h2>
          <p>Înscrie-te și participă la evenimente sportive cu recunoaștere facială!</p>
        </div>
        <div className="right-panel">
          <h3>Înregistrare</h3>
          <form onSubmit={handleSubmit} className="register-form">
            <input
              type="text"
              name="full_name"
              placeholder="Nume complet"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
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
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="alergator">Alergător</option>
              <option value="fotograf">Fotograf</option>
            </select>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="gdpr"
                checked={formData.gdprAccepted}
                onChange={(e) =>
                  setFormData({ ...formData, gdprAccepted: e.target.checked })
                }
                required
              />
              <label htmlFor="gdpr">
                Sunt de acord cu <a href="/politica-confidentialitate" target="_blank">Politica de Confidențialitate</a> și cu prelucrarea datelor mele personale conform GDPR.
              </label>
            </div>
            <button type="submit">Înregistrează-te</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
