import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpLocal } from "../services/localAuth";
import "./Auth.css";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("patient"); // 'patient' | 'caregiver'
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await signUpLocal({ name, email, password: pw, role });
      nav("/"); // go to app
    } catch (e) {
      setErr(e?.message || "Unable to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-form">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="SafeCircle logo" className="sidebar-logo" />
          </div>
          <h2>Create Account</h2>
          <p className="subtitle">Join SafeCircle and stay protected</p>
        </div>

        {err && <div className="auth-alert error">{err}</div>}

        <div className="auth-input-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            className="auth-input"
            required
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            className="auth-input"
            required
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="auth-input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="auth-input"
            required
            type="password"
            placeholder="Create a password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="auth-input-group">
          <label>Account Type</label>
          <div className="auth-radio-group">
            <label className="auth-radio-label">
              <input
                type="radio"
                checked={role === "caregiver"}
                onChange={() => setRole("caregiver")}
                disabled={loading}
              />
              Caregiver
            </label>
            <label className="auth-radio-label">
              <input
                type="radio"
                checked={role === "patient"}
                onChange={() => setRole("patient")}
                disabled={loading}
              />
              Patient
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className={`auth-submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? '' : 'Create Account'}
        </button>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/auth/login">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
