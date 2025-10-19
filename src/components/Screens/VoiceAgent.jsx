import React, { useCallback, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import './VoiceAgent.css';

const AGENT_ID = 'agent_4501k7xa0jn2fgkrvnrtfwwst6hq';

const VoiceAgent = ({ inline = false, showHeader = !inline }) => {
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const conversation = useConversation({
    onError: (e) => setError(e?.message || 'Conversation error'),
    onStatusChange: () => {},
    onModeChange: () => {},
  });

  const start = useCallback(async () => {
    if (conversation.status === 'connected' || isStarting) return;
    setError('');
    setIsStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
    } catch (e) {
      setError(e?.message || 'Unable to start');
    } finally {
      setIsStarting(false);
    }
  }, [conversation, isStarting]);

  const stop = useCallback(async () => {
    setError('');
    try { await conversation.endSession(); } catch (_) {}
  }, [conversation]);

  const isActive = conversation.status === 'connected';

  const content = (
    <div className={`voice-button-screen${inline ? ' inline' : ''}`}>
      {showHeader && <div className="ai-title">Talk to Sophie</div>}
      {showHeader && <div className="ai-subtitle">Hands‑free assistance</div>}

      <button
        className={`ai-voice-btn ${isActive || isStarting ? 'listening' : ''}`}
        onClick={isActive ? stop : start}
        aria-pressed={isActive}
        aria-label={isActive ? 'Stop call' : 'Start call'}
        disabled={isStarting}
      >
        <span className="btn-emoji">🎧</span>
        <span className="btn-text">{isActive ? 'Stop' : (isStarting ? 'Connecting…' : 'Start')}</span>
      </button>

      {error && (
        <div className="ai-alert error" role="alert">{error}</div>
      )}

      <div className="ai-hint">{isActive ? 'Connected' : 'Disconnected'}</div>
    </div>
  );

  if (inline) return content;

  return (
    <div className="screen-container">
      {content}
    </div>
  );
};

export default VoiceAgent;
