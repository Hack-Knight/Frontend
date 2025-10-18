// components/Screens/RoleSelectScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RoleSelectScreen({ onSelectRole }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Choose your role</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#C084FC" }]}
        onPress={() => onSelectRole("caregiver")}
      >
        <Text style={styles.btnText}>CAREGIVER</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#60A5FA" }]}
        onPress={() => onSelectRole("user")}
      >
        <Text style={styles.btnText}>USER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 32 },
  button: { width: "70%", paddingVertical: 14, borderRadius: 10, marginBottom: 16 },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
