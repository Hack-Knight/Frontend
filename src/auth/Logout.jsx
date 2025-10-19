// auth/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOutLocal } from "../services/localAuth";

export default function Logout() {
  const nav = useNavigate();
  useEffect(() => {
    signOutLocal();
    nav("/auth/login", { replace: true });
    // window.location.reload(); // (optional hard refresh)
  }, [nav]);
  return null;
}
