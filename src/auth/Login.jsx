import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInLocal } from "../services/localAuth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      signInLocal({ email, password: pw });
      nav("/"); // go to app
    } catch (e) {
      setErr(e?.message || "Invalid credentials");
    }
  };

  return (
    <div className="screen-container" style={{ display: "grid", placeItems: "center" }}>
      <form onSubmit={submit} className="card form" style={{ maxWidth: 420, width: "100%" }}>
        <h2>Log in</h2>

        {err && <div className="alert alert-error">{err}</div>}

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

        <button className="btn btn-primary" style={{ marginTop: 12 }}>
          Log in
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          New here?{" "}
          <Link to="/auth/signup" className="link">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
