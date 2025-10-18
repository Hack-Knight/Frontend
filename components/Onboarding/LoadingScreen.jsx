import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>Making your SafeCircle...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { marginTop: 16, fontSize: 18, fontWeight: "600", color: "#111" },
});
