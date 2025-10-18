import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PeopleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>People Screen</Text>
      <Text style={styles.subtitle}>
        Manage family members, caregivers, and linked users here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
