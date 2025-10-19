// src/components/Screens/PairScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserByEmail } from "../../services/localAuth";
import { pairUsers, unpair, getPairForUser, myPatients, myCaregiver } from "../../services/localPairing";
import "./Pair.css";

export default function PairScreen() {
  const nav = useNavigate();
  const [me, setMe] = useState(() => getCurrentUser());
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pair, setPair] = useState(null);
  const [patients, setPatients] = useState([]);

  const isCaregiver = me?.role === "caregiver";
  const isPatient   = me?.role === "patient";

  const refresh = () => {
    setPair(getPairForUser(me?.id));
    if (isCaregiver) setPatients(myPatients(me.id));
  };

  useEffect(() => { refresh(); }, []);

  const doPair = (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      if (!isCaregiver) throw new Error("Only caregivers can pair.");
      const target = getUserByEmail(email);
      if (!target) throw new Error("No user found with that email.");
      pairUsers(me.id, target.id);
      setInfo(`Paired with ${target.name || target.email}.`);
      setEmail("");
      refresh();
    } catch (err) {
      setError(err?.message || "Unable to pair.");
    }
  };

  const doUnpair = (pid) => {
    setError(""); setInfo("");
    try {
      if (isCaregiver) {
        const patientId = pid ?? pair?.patientId ?? patients[0]?.id;
        if (!patientId) throw new Error("No patient to unpair.");
        unpair(me.id, patientId);
      } else if (isPatient) {
        if (!pair?.caregiverId) throw new Error("No caregiver to unpair.");
        unpair(pair.caregiverId, me.id);
      }
      setInfo("Unpaired successfully.");
      refresh();
    } catch (err) {
      setError(err?.message || "Unable to unpair.");
    }
  };

  const base = process.env.PUBLIC_URL || '';

  return (
    <div className="pair-container">
      <div className="pair-form">
        <div className="pair-header">
          <img src={`${base}/icons/people.png`} alt="" aria-hidden="true"/>
          <h1>Pair Patient</h1>
        </div>
        <p className="pair-subtitle">Connect with your caregiver or patients</p>

        {error && <div className="pair-alert error">{error}</div>}
        {info && <div className="pair-alert success">{info}</div>}

        {isCaregiver && (
          <div className="pair-section">
            <h3>Invite or pair by email</h3>
            <p>Your patient should sign up with this email.</p>
            <form onSubmit={doPair} className="pair-input-group">
              <input
                type="email"
                placeholder="patient@email.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                className="pair-input"
              />
              <button className="pair-btn pair-btn-primary">Pair</button>
            </form>
          </div>
        )}

        <div className="pair-section">
          <h3>Current pairing</h3>
          {isCaregiver && (
            patients.length === 0 ? (
              <p className="pair-list-empty">No patients paired yet.</p>
            ) : (
              <ul className="pair-list">
                {patients.map(p => (
                  <li key={p.id} className="pair-list-item">
                    <img src={`${base}/icons/people.png`} alt="" aria-hidden="true"/>
                    <strong>{p.name || p.email}</strong>
                    <button className="pair-btn pair-btn-danger" onClick={() => doUnpair(p.id)}>Unpair</button>
                  </li>
                ))}
              </ul>
            )
          )}
          {isPatient && (
            !pair ? (
              <p className="pair-list-empty">You are not paired. Ask your caregiver to pair with your email.</p>
            ) : (
              <div className="pair-list-item">
                <img src={`${base}/icons/people.png`} alt="" aria-hidden="true"/>
                <strong>Caregiver: {myCaregiver(me.id)?.name || myCaregiver(me.id)?.email}</strong>
                <button className="pair-btn pair-btn-danger" onClick={() => doUnpair()}>Unpair</button>
              </div>
            )
          )}
        </div>

        <div className="pair-footer">
          <button className="pair-btn-back" onClick={() => nav("/home")}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}
