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

  useEffect(() => { refresh(); }, []); // on mount

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

  const doUnpair = () => {
    setError(""); setInfo("");
    try {
      if (isCaregiver) {
        // If you support multiple patients, choose which to unpair.
        // Here we unpair the first (or only) patient in list, or pair.patientId.
        const pid = pair?.patientId ?? patients[0]?.id;
        if (!pid) throw new Error("No patient to unpair.");
        unpair(me.id, pid);
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

  return (
    <div className="screen-container" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1>Pairing</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      {isCaregiver && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Pair with a Patient</h3>
          <form onSubmit={doPair} className="row" style={{ gap: 8 }}>
            <input
              type="email"
              placeholder="Patient email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary">Pair</button>
          </form>
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
            Tip: Ask your patient to create an account first using the same email.
          </p>
        </div>
      )}

      <div className="card">
        <h3>Status</h3>
        {isCaregiver && (
          <>
            {patients.length === 0 ? (
              <p>You are not paired with any patients yet.</p>
            ) : (
              <ul className="list">
                {patients.map(p => (
                  <li key={p.id}>
                    <strong>{p.name || p.email}</strong> — patient
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {isPatient && (
          <>
            {!pair ? (
              <p>You are not paired. Ask your caregiver to pair with your email.</p>
            ) : (
              <p>
                Caregiver: <strong>{myCaregiver(me.id)?.name || myCaregiver(me.id)?.email}</strong>
              </p>
            )}
          </>
        )}
        {(pair || (isCaregiver && patients.length > 0)) && (
          <button className="btn btn-danger" style={{ marginTop: 8 }} onClick={doUnpair}>
            Unpair
          </button>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn btn-dark" onClick={() => nav("/")}>Back to Map</button>
      </div>
    </div>
  );
}
