import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";

export default function SOSButton({ onSOS, onAITrigger }) {
  const [pressCount, setPressCount] = useState(0);
  const [scale] = useState(new Animated.Value(1));

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Increase SOS press count
    setPressCount((prev) => {
      const newCount = prev + 1;

      if (newCount >= 3) {
        onAITrigger?.(); // Trigger AI safety check
        return 0; // Reset counter
      } else {
        onSOS?.(); // Normal SOS alert
        return newCount;
      }
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48, // rounded-full
    backgroundColor: "#ff4d4f",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6, // Android shadow
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
