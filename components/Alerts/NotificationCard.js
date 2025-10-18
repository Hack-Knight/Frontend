// components/Alerts/NotificationCard.jsx
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";

export default function NotificationCard({ type, message, time, onPress }) {
  const isSOS = type === "SOS";
  const color = isSOS ? "#ff4d4f" : "#52c41a";
  const bg = isSOS ? "#fff5f5" : "#f6ffed";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderLeftColor: color },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.title}>{isSOS ? "🚨 Alert" : "✅ Safe"}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 288, // ~ Tailwind w-72 (18rem)
    padding: 16, // p-4
    borderRadius: 12, // rounded-xl
    borderLeftWidth: 6,
    // Shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Shadow (Android)
    elevation: 4,
    marginBottom: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "600",
    color: "#1f2937", // gray-800
  },
  time: {
    fontSize: 12,
    color: "#9ca3af", // gray-400
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    color: "#374151", // gray-700
  },
});
