import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

import SplashScreen from "./components/Onboarding/SplashScreen";
import RoleSelectScreen from "./components/Onboarding/RoleSelectScreen";
import LoadingScreen from "./components/Onboarding/LoadingScreen";
import HomeScreen from "./components/Screens/HomeScreen";
import MapScreen from "./components/Screens/MapScreen";
import PeopleScreen from "./components/Screens/PeopleScreen";
import VoiceScreen from "./components/Screens/VoiceScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: { height: 60 },
        tabBarIcon: ({ color, size, focused }) => {
          const s = focused ? 26 : 22;
          switch (route.name) {
            case "Home":
              return <Ionicons name="home" size={s} color={color} />;
            case "Map":
              return <Ionicons name="map" size={s} color={color} />;
            case "People":
              return <Ionicons name="people" size={s} color={color} />;
            case "Voice":
              return <Ionicons name="mic" size={s} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Voice" component={VoiceScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [phase, setPhase] = useState("splash"); // 'splash' | 'role' | 'loading' | 'main'

  useEffect(() => {
    const timer = setTimeout(() => setPhase("role"), 2000); // show splash 2s
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = () => {
    setPhase("loading");
    setTimeout(() => setPhase("main"), 1500);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {phase === "splash" && <Stack.Screen name="Splash" component={SplashScreen} />}
        {phase === "role" && (
          <Stack.Screen name="Role">
            {(props) => <RoleSelectScreen {...props} onSelectRole={handleRoleSelect} />}
          </Stack.Screen>
        )}
        {phase === "loading" && <Stack.Screen name="Loading" component={LoadingScreen} />}
        {phase === "main" && <Stack.Screen name="MainTabs" component={MainTabs} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
