import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { signUpLocal } from "../../services/localAuth"; 



export default function SignupScreen({ navigation, onAuthed }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) return Alert.alert("Name required", "Please enter your name.");
    if (!email.trim()) return Alert.alert("Email required", "Please enter your email.");
    if (pw.length < 6) return Alert.alert("Weak password", "Use at least 6 characters.");

    try {
      setLoading(true);
      // no role here — role will be chosen on the RoleSelect screen
      await signUpLocal({ name: name.trim(), email: email.trim(), password: pw, role: "user" });
        onAuthed?.();
    } catch (e) {
      Alert.alert("Signup failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Jane Doe"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="name@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16, color: "#111827" },
  label: { marginTop: 12, marginBottom: 6, color: "#374151", fontWeight: "600" },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#fafafa",
  },
  primaryBtn: { marginTop: 18, backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  link: { marginTop: 16, textAlign: "center", color: "#2563EB", fontWeight: "700" },
});
