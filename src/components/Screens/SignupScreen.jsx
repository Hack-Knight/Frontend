import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupScreen.css";

const SignUpScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"

  const handleSignUp = (e) => {
    e.preventDefault();
    setMessage("");

    if (!name || !email || !password || !confirmPassword || !role) {
      setMessageType("error");
      setMessage("Please fill in all fields and select a role.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    const existingUser = JSON.parse(localStorage.getItem("userData"));
    if (existingUser && existingUser.email === email) {
      setMessageType("error");
      setMessage("An account with this email already exists.");
      return;
    }

    const userData = { name, email, password, role };
    localStorage.setItem("userData", JSON.stringify(userData));

    setMessageType("success");
    setMessage("Account created successfully! Redirecting...");

    setTimeout(() => navigate("/landing"), 1500);
  };

  return (
    <div className="signup-container">
      <div className="logo-container">
        <img src="/logo.png" alt="SafeCircle Logo" className="signup-logo" />
      </div>

      <form className="signup-form" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="signup-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="signup-input"
        />

        {/* Role Selection */}
        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="caregiver"
              checked={role === "caregiver"}
              onChange={() => setRole("caregiver")}
            />
            <span>Caregiver</span>
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="patient"
              checked={role === "patient"}
              onChange={() => setRole("patient")}
            />
            <span>Patient</span>
          </label>
        </div>

        {message && (
          <div
            className={`message-container ${
              messageType === "error" ? "warning" : "success"
            }`}
          >
            {message}
          </div>
        )}

        <button type="submit" className="signup-button">
          Sign Up
        </button>

        <div className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/landing")} className="login-link-text">
            Log In
          </span>
        </div>
      </form>
    </div>
  );
};

export default SignUpScreen;
