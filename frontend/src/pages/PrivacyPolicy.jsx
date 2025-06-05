import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Politica de Confidențialitate</h1>
      <p>Data actualizării: 20.02.2025</p>

      <p>
        Această Politică de Confidențialitate descrie modul în care sunt colectate, utilizate și protejate informațiile tale personale atunci când utilizezi aplicația noastră.
      </p>

      <p>
        Prin utilizarea aplicației, ești de acord cu termenii prezentei politici.
      </p>

      <h2>1. Ce date colectăm?</h2>
      <ul>
        <li>Fotografia ta (selfie) în momentul încărcării pentru căutarea automată</li>
        <li>Datele oferite la înregistrare: nume complet, email, rol ales (fotograf/alergător)</li>
      </ul>

      <h2>2. Cum folosim datele?</h2>
      <ul>
        <li>Imaginea selfie este utilizată doar pentru compararea automată cu galeriile existente</li>
        <li>Nu este salvată și este ștearsă imediat după procesare</li>
        <li>Datele tale de profil sunt utilizate exclusiv pentru accesul și personalizarea dashboardului</li>
      </ul>

      <h2>3. Ce NU facem cu datele tale?</h2>
      <ul>
        <li>Nu folosim imaginile pentru profilare biometrică</li>
        <li>Nu partajăm datele tale cu terți</li>
        <li>Nu folosim imaginile în scopuri comerciale sau pentru antrenarea modelelor AI</li>
      </ul>

      <h2>4. Cât timp păstrăm datele?</h2>
      <ul>
        <li>Selfie-ul încărcat pentru matching este șters imediat după procesare</li>
        <li>Datele de cont (email, nume) sunt păstrate până la ștergerea contului de către utilizator</li>
        <li>Pozele salvate în galerie sunt păstrate până când le ștergi manual sau soliciți ștergerea contului</li>
      </ul>

      <h2>5. Cine are acces la datele tale?</h2>
      <ul>
        <li>Doar tu și sistemul aplicației</li>
        <li>Administratorul aplicației poate vizualiza informațiile doar în scopuri de administrare și mentenanță</li>
      </ul>

      <h2>6. Drepturile tale</h2>
      <p>Conform GDPR, ai dreptul:</p>
      <ul>
        <li>de acces la datele tale</li>
        <li>de rectificare a datelor</li>
        <li>de ștergere („dreptul de a fi uitat”)</li>
        <li>de restricționare a prelucrării</li>
        <li>de portabilitate a datelor</li>
        <li>de opoziție</li>
      </ul>
      <p>Poți exercita aceste drepturi prin cerere trimisă prin formularul de contact din aplicație.</p>

      <h2>7. Minorii</h2>
      <p>
        Aplicația nu este destinată utilizatorilor sub 16 ani. Dacă ești minor, înregistrarea și utilizarea aplicației necesită acordul părintelui sau tutorelui legal.
      </p>

      <h2>8. Actualizări ale politicii</h2>
      <p>
        Putem actualiza această politică periodic. Te vom informa prin aplicație atunci când sunt modificări relevante.
      </p>
      <p>
        🔁 Vizitează această pagină regulat pentru a fi la curent cu ultimele versiuni ale politicii de confidențialitate.
      </p>

      <p style={{ marginTop: "3rem", fontStyle: "italic" }}>
        © Face Recognition App – 2025
      </p>
    </div>
  );
};

export default PrivacyPolicy;
