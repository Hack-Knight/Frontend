import React, { useState } from 'react';

const SOSButton = ({ onSOS, onAITrigger }) => {
  const [pressCount, setPressCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);

    // Increase the SOS press count
    setPressCount((prev) => {
      const newCount = prev + 1;

      if (newCount >= 3) {
        onAITrigger();   // Trigger AI safety check
        return 0;        // Reset counter after AI check
      } else {
        onSOS();         // Normal SOS alert
        return newCount;
      }
    });

    // Reset the button press animation after 500ms
    setTimeout(() => {
      setIsPressed(false);
    }, 500);
  };

  return (
    <button
      onClick={handlePress}
      className={`w-24 h-24 rounded-full font-bold text-white text-lg shadow-lg transition-all
        ${isPressed ? 'bg-red-700 scale-95' : 'bg-red-500 hover:bg-red-600'}
      `}
    >
      SOS
    </button>
  );
};

export default SOSButton;
