// src/components/Screens/PairScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserByEmail } from "../../services/localAuth";
import { pairUsers, unpair, getPairForUser, myPatients, myCaregiver } from "../../services/localPairing";

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
    <div className="screen-container" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="map-header" style={{ alignItems: 'center' }}>
        <h1 style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src={`${base}/icons/people.png`} alt="" width={24} height={24} aria-hidden="true"/>
          Pair Patient
        </h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      {isCaregiver && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Invite or pair by email</h3>
          <p style={{ marginTop: 4, opacity: 0.85 }}>Your patient should sign up with this email.</p>
          <form onSubmit={doPair} className="row" style={{ gap: 8, marginTop: 10 }}>
            <input
              type="email"
              placeholder="patient@email.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary">Pair</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Current pairing</h3>
        {isCaregiver && (
          patients.length === 0 ? (
            <p>No patients paired yet.</p>
          ) : (
            <ul className="list">
              {patients.map(p => (
                <li key={p.id} className="row" style={{ alignItems:'center', gap:10 }}>
                  <img src={`${base}/icons/people.png`} alt="" width={18} height={18} aria-hidden="true"/>
                  <strong style={{ flex:1 }}>{p.name || p.email}</strong>
                  <button className="btn btn-ghost btn-small" onClick={() => doUnpair(p.id)}>Unpair</button>
                </li>
              ))}
            </ul>
          )
        )}
        {isPatient && (
          !pair ? (
            <p>You are not paired. Ask your caregiver to pair with your email.</p>
          ) : (
            <div className="row" style={{ alignItems:'center', gap:10 }}>
              <img src={`${base}/icons/people.png`} alt="" width={18} height={18} aria-hidden="true"/>
              Caregiver: <strong>{myCaregiver(me.id)?.name || myCaregiver(me.id)?.email}</strong>
              <button className="btn btn-ghost btn-small" onClick={() => doUnpair()}>Unpair</button>
            </div>
          )
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={() => nav("/map")}>Back to Map</button>
      </div>
    </div>
  );
}
