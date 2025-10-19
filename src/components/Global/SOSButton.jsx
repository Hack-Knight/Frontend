import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getCurrentUser } from "../../services/localAuth";
import { myCaregiver } from "../../services/localPairing";
import { getLocation } from "../../services/localLocation";
import { pushAlert } from "../../services/alerts";

export default function SOSButton() {
  const me = getCurrentUser();
  const [sending, setSending] = useState(false);
  const [label, setLabel] = useState("SOS");

  const caregiver = useMemo(() => (me ? myCaregiver(me.id) : null), [me]);

  if (!me || me.role === "caregiver") return null;

  const mountNode = typeof document !== "undefined" ? document.body : null;
  if (!mountNode) return null;

  async function sendSOS() {
    if (sending) return;
    if (!caregiver) {
      setLabel("PAIR");
      setTimeout(() => setLabel("SOS"), 1400);
      return;
    }

    setSending(true);
    setLabel("…");
    try {
      const loc = getLocation(me.id);
      pushAlert({
        toUserId: caregiver.id,
        fromUserId: me.id,
        type: "SOS",
        payload: {
          message: `${me.name || "Patient"} requested immediate assistance`,
          location: loc ? {
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            ts: loc.ts,
          } : null,
        },
      });
      setLabel("Sent");
      setTimeout(() => setLabel("SOS"), 1500);
    } catch (e) {
      setLabel("Retry");
      setTimeout(() => setLabel("SOS"), 1800);
    } finally {
      setSending(false);
    }
  }

  const wrapperStyle = {
    position: "fixed",
    right: 81,
    top: "calc(16px + env(safe-area-inset-top))",
    zIndex: 9999,
  };
  const btnStyle = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 18,
    color: "#fff",
    background: "linear-gradient(135deg, #ff4d4f, #d32f2f)",
    boxShadow: "0 8px 24px rgba(211, 47, 47, 0.4)",
  };

  return createPortal(
    <div className="sos-fab-wrapper" style={wrapperStyle} aria-live="polite">
      <button
        className="sos-fab"
        style={btnStyle}
        onClick={sendSOS}
        aria-label="Send SOS to caregiver"
        disabled={sending}
        title={caregiver ? "Send SOS to caregiver" : "Pair with a caregiver to send SOS"}
      >
        {label}
      </button>
    </div>,
    mountNode
  );
}
