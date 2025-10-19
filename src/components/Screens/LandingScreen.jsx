import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingScreen.css";

export default function LandingScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("userData"));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      setMessage("Sign in successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => navigate("/home"), 1000); // ✅ redirect to home page after success
    } else {
      setMessage("Invalid email or password. Please try again.");
      setMessageType("warning");
    }
  };

  return (
    <div className="landing-container">
      <div className="logo-container">
        <img src="/logo.png" alt="SafeCircle Logo" className="landing-logo" />
      </div>

      <form className="signin-form" onSubmit={handleSignIn}>
        <input
          type="text"
          placeholder="Email"
          className={`signin-input ${messageType === "warning" ? "input-error" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className={`signin-input ${messageType === "warning" ? "input-error" : ""}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="signin-button">
          Sign In
        </button>

        {/* ✅ Clean warning/success UI */}
        {message && (
          <div className={`message-container ${messageType}`}>
            {message}
          </div>
        )}

        <div className="signup-text">
          Don’t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </div>
      </form>
    </div>
  );
}
