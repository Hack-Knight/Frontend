import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpLocal } from "../services/localAuth";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("patient"); // 'patient' | 'caregiver'
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      signUpLocal({ name, email, password: pw, role });
      nav("/"); // go to app
    } catch (e) {
      setErr(e?.message || "Unable to sign up");
    }
  };

  return (
    <div className="screen-container" style={{ display: "grid", placeItems: "center" }}>
      <form onSubmit={submit} className="card form" style={{ maxWidth: 420, width: "100%" }}>
        <h2>Create Account</h2>

        {err && <div className="alert alert-error">{err}</div>}

        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          required
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <div className="row" style={{ gap: 16, marginTop: 8 }}>
          <label>
            <input
              type="radio"
              checked={role === "caregiver"}
              onChange={() => setRole("caregiver")}
            />{" "}
            Caregiver
          </label>
          <label>
            <input
              type="radio"
              checked={role === "patient"}
              onChange={() => setRole("patient")}
            />{" "}
            Patient
          </label>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 12 }}>
          Sign up
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/auth/login" className="link">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
