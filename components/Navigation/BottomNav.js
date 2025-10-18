import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const Item = ({ label, routeName, iconSource, isActive, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={iconSource} style={[styles.icon, isActive && styles.iconActive]} />
    <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const items = [
    { label: "Home",   name: "Home",   icon: require("../../assets/icons/home.png") },
    { label: "Map",    name: "Map",    icon: require("../../assets/icons/map.png") },
    { label: "People", name: "People", icon: require("../../assets/icons/people.png") },
    { label: "Voice",  name: "Voice",  icon: require("../../assets/icons/mic.png") },
  ];


  return (
    <View style={styles.wrap}>
      {items.map((it) => (
        <Item
          key={it.name}
          label={it.label}
          routeName={it.name}
          iconSource={it.icon}
          isActive={route.name === it.name}
          onPress={() => navigation.navigate(it.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  item: { alignItems: "center", justifyContent: "center" },
  icon: { width: 22, height: 22, tintColor: "#6B7280" },      // gray-500
  iconActive: { tintColor: "#2563EB" },                       // blue-600
  label: { marginTop: 4, fontSize: 12, color: "#6B7280" },
  labelActive: { color: "#2563EB", fontWeight: "600" },
});
