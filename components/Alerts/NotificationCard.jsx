import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationCard = ({ type, message, time, distance }) => {
  const isSOS = type === 'SOS';
  const isReturned = type === 'SafeZone';
  
  const getCardStyle = () => {
    if (isSOS) {
      return [styles.card, styles.sosCard];
    } else if (isReturned) {
      return [styles.card, styles.safeCard];
    } else {
      return [styles.card, styles.defaultCard];
    }
  };

  const getIconAndTitle = () => {
    if (isSOS) {
      return { icon: '🚨', title: 'Alert' };
    } else if (isReturned) {
      return { icon: '✅', title: 'Safe' };
    } else {
      return { icon: 'ℹ️', title: 'Info' };
    }
  };

  const { icon, title } = getIconAndTitle();

  return (
    <View style={getCardStyle()}>
      <View style={styles.header}>
        <Text style={styles.titleText}>
          {icon} {title}
        </Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      
      <Text style={styles.messageText}>{message}</Text>
      
      {distance && (
        <Text style={styles.distanceText}>
          Distance: {distance}m from safe zone
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sosCard: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 6,
    borderLeftColor: '#ff4d4f',
  },
  safeCard: {
    backgroundColor: '#f6ffed',
    borderLeftWidth: 6,
    borderLeftColor: '#52c41a',
  },
  defaultCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 6,
    borderLeftColor: '#1890ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  distanceText: {
    fontSize: 12,
    color: '#ff4d4f',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default NotificationCard;
