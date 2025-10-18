import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>SafeCircle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  logo: { width: 140, height: 140, resizeMode: "contain", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#0B2545" },
});
