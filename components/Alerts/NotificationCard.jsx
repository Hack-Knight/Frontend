import React from 'react';

const NotificationCard = ({ type, message, time }) => {
  const isSOS = type === 'SOS';
  const color = isSOS ? '#ff4d4f' : '#52c41a';
  const bg = isSOS ? '#fff5f5' : '#f6ffed';

  return (
    <div
      className="w-72 p-4 rounded-xl shadow-lg transition transform hover:scale-105"
      style={{
        borderLeft: `6px solid ${color}`,
        backgroundColor: bg,
      }}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-800">
          {isSOS ? '🚨 Alert' : '✅ Safe'}
        </span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <p className="text-sm text-gray-700 mt-1">{message}</p>
    </div>
  );
};

export default NotificationCard;

