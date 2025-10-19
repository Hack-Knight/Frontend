import React, { useState, useEffect, useRef } from 'react';
import './VoiceScreen.css';

const VoiceScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState([
    {
      id: 1,
      command: "Emergency help",
      action: "Trigger emergency alert",
      enabled: true
    },
    {
      id: 2,
      command: "Call emergency contact",
      action: "Call primary emergency contact",
      enabled: true
    },
    {
      id: 3,
      command: "Where am I",
      action: "Share current location",
      enabled: true
    },
    {
      id: 4,
      command: "Safe zone status",
      action: "Check if in safe zone",
      enabled: true
    }
  ]);
  const [alert, setAlert] = useState(null);
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupportsSpeechRecognition(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setAlert({ type: 'info', message: 'Listening for voice commands...' });
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAlert({ 
          type: 'error', 
          message: `Speech recognition error: ${event.error}` 
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    // Simple command matching - in a real app, you'd use more sophisticated NLP
    const commands = {
      'emergency help': () => triggerEmergencyAlert(),
      'help me': () => triggerEmergencyAlert(),
      'emergency': () => triggerEmergencyAlert(),
      'call emergency contact': () => callEmergencyContact(),
      'call emergency': () => callEmergencyContact(),
      'where am i': () => shareLocation(),
      'location': () => shareLocation(),
      'safe zone status': () => checkSafeZone(),
      'am i safe': () => checkSafeZone(),
      'safe zone': () => checkSafeZone()
    };
    
    let commandFound = false;
    
    for (const [trigger, action] of Object.entries(commands)) {
      if (command.includes(trigger)) {
        await action();
        commandFound = true;
        break;
      }
    }
    
    if (!commandFound) {
      setAlert({
        type: 'warning',
        message: `Command "${command}" not recognized. Try "emergency help", "call emergency contact", "where am i", or "safe zone status".`
      });
    }
    
    setIsProcessing(false);
    
    // Auto-stop listening after processing
    setTimeout(() => {
      stopListening();
    }, 2000);
  };

  const triggerEmergencyAlert = () => {
    setAlert({
      type: 'danger',
      message: 'EMERGENCY ALERT TRIGGERED! Notifying all emergency contacts...'
    });
    
    // In a real app, this would trigger actual emergency procedures
    setTimeout(() => {
      setAlert({
        type: 'success',
        message: 'Emergency contacts have been notified of your situation.'
      });
    }, 3000);
  };

  const callEmergencyContact = () => {
    setAlert({
      type: 'info',
      message: 'Calling primary emergency contact...'
    });
    
    // In a real app, this would initiate a call
    setTimeout(() => {
      window.location.href = 'tel:+15551234567'; // Example number
    }, 1000);
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAlert({
            type: 'success',
            message: `Your location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. Location shared with emergency contacts.`
          });
        },
        (error) => {
          setAlert({
            type: 'error',
            message: 'Unable to get your location. Please enable location services.'
          });
        }
      );
    } else {
      setAlert({
        type: 'error',
        message: 'Location services not supported by this browser.'
      });
    }
  };

  const checkSafeZone = () => {
    // Mock safe zone check - in a real app, this would check against actual safe zones
    setAlert({
      type: 'success',
      message: 'You are currently in a safe zone. All systems normal.'
    });
  };

  const startListening = () => {
    if (recognitionRef.current && supportsSpeechRecognition) {
      setTranscript('');
      recognitionRef.current.start();
      
      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
  };

  const toggleCommand = (commandId) => {
    setVoiceCommands(commands =>
      commands.map(cmd =>
        cmd.id === commandId
          ? { ...cmd, enabled: !cmd.enabled }
          : cmd
      )
    );
  };

  return (
    <div className="screen-container">
      <div className="voice-screen">
        <div className="voice-header">
          <h1>Voice Assistant</h1>
          <p className="voice-subtitle">Speak commands for quick emergency actions</p>
        </div>

        {/* Browser Support Check */}
        {!supportsSpeechRecognition && (
          <div className="alert alert-warning">
            <strong>Speech Recognition Not Supported</strong><br />
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome, Firefox, or Safari.
          </div>
        )}

        {/* Alert */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
            <button 
              className="alert-close"
              onClick={() => setAlert(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Voice Control Panel */}
        <div className="card voice-control-panel">
          <div className="voice-visualizer">
            <div className={`voice-indicator ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
              <div className="voice-waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
              <div className="voice-icon">🎤</div>
            </div>
          </div>

          <div className="voice-status">
            {isListening && (
              <p className="status-text listening">
                Listening... Speak your command
              </p>
            )}
            {isProcessing && (
              <p className="status-text processing">
                Processing your command...
              </p>
            )}
            {!isListening && !isProcessing && (
              <p className="status-text idle">
                Tap the microphone to start voice commands
              </p>
            )}
          </div>

          {transcript && (
            <div className="transcript">
              <strong>You said:</strong> "{transcript}"
            </div>
          )}

          <div className="voice-controls">
            {!isListening ? (
              <button 
                className="btn voice-btn start-btn"
                onClick={startListening}
                disabled={!supportsSpeechRecognition}
              >
                <span className="btn-icon">🎤</span>
                Start Listening
              </button>
            ) : (
              <button 
                className="btn voice-btn stop-btn"
                onClick={stopListening}
              >
                <span className="btn-icon">⏹️</span>
                Stop Listening
              </button>
            )}
          </div>
        </div>

        {/* Available Commands */}
        <div className="card commands-panel">
          <h3>Available Voice Commands</h3>
          <p className="commands-description">
            You can speak these commands when voice recognition is active:
          </p>
          
          <div className="commands-list">
            {voiceCommands.map((command) => (
              <div key={command.id} className={`command-item ${command.enabled ? 'enabled' : 'disabled'}`}>
                <div className="command-content">
                  <div className="command-trigger">
                    <strong>"{command.command}"</strong>
                  </div>
                  <div className="command-description">
                    {command.action}
                  </div>
                </div>
                <label className="command-toggle">
                  <input
                    type="checkbox"
                    checked={command.enabled}
                    onChange={() => toggleCommand(command.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card quick-actions-panel">
          <h3>Quick Actions</h3>
          <p>Can't use voice? Use these buttons instead:</p>
          
          <div className="action-buttons">
            <button 
              className="action-btn emergency-btn"
              onClick={triggerEmergencyAlert}
            >
              🚨 Emergency Alert
            </button>
            <button 
              className="action-btn call-btn"
              onClick={callEmergencyContact}
            >
              📞 Call Emergency Contact
            </button>
            <button 
              className="action-btn location-btn"
              onClick={shareLocation}
            >
              📍 Share Location
            </button>
            <button 
              className="action-btn status-btn"
              onClick={checkSafeZone}
            >
              🛡️ Check Safe Zone Status
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="card tips-panel">
          <h3>Voice Command Tips</h3>
          <ul className="tips-list">
            <li>Speak clearly and at normal volume</li>
            <li>Wait for the "listening" indicator before speaking</li>
            <li>Use simple, direct commands</li>
            <li>Commands work best in quiet environments</li>
            <li>Emergency commands are processed with highest priority</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceScreen;