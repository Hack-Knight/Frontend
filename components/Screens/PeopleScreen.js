// components/Screens/PeopleScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
} from "react-native";

export default function PeopleScreen() {
  const [contacts, setContacts] = useState([
    { },    
    {  },    
    {  }, 
  ]);

  const callNumber = async (phone) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot place call", `Your device can't handle: ${phone}`);
      }
    } catch (e) {
      Alert.alert("Call failed", e?.message ?? "Unknown error");
    }
  };

  const onAdd = () => {
    // For now just demo—replace with a modal/form later
    Alert.alert("Add contact", "Open your Add Contact flow here.");
  };

  const onSOS = () => {
    Alert.alert("SOS", "Trigger your SOS flow here.");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => callNumber(item.phone)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Call ${item.name}`}
    >
      <Text style={styles.cardName}>{item.name}</Text>

      {/* Replace the emoji with Ionicons if you prefer:
         import { Ionicons } from '@expo/vector-icons';
         <Ionicons name="call-outline" size={22} color="#fff" />
      */}
      <Text style={styles.cardIcon}>📞</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity
          onPress={onAdd}
          style={styles.addBtn}
          accessibilityRole="button"
          accessibilityLabel="Add contact"
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts list */}
      <FlatList
        data={contacts}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* SOS button */}
      <TouchableOpacity
        style={styles.sosBtn}
        onPress={onSOS}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Call for SOS"
      >
        <Text style={styles.sosText}>CALL FOR SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 20, color: "#1f2937", lineHeight: 20 },

  listContent: { paddingTop: 8, paddingBottom: 8 },
  card: {
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardIcon: { color: "#fff", fontSize: 20 },

  sosBtn: {
    backgroundColor: "#e53e3e",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 16,
  },
  sosText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
});
