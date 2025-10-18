import React from "react";
import { SafeAreaView, ScrollView, View, StyleSheet } from "react-native";

/**
 * ScreenWrapper provides consistent layout for all screens:
 * - Handles safe area insets
 * - Optional scrolling (via `scroll` prop)
 * - Common padding and background color
 */
export default function ScreenWrapper({
  children,
  scroll = false,
  style,
  contentStyle,
}) {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <Container
        style={[styles.container, scroll && styles.scrollContainer, contentStyle]}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa", // light background (matches your MapScreen)
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
