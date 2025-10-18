// App.js
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import SplashScreen from "./components/Onboarding/SplashScreen";
import RoleSelectScreen from "./components/Onboarding/RoleSelectScreen";
import LoadingScreen from "./components/Onboarding/LoadingScreen";
import HomeScreen from "./components/Screens/HomeScreen";
import MapScreen from "./components/Screens/MapScreen";
import PeopleScreen from "./components/Screens/PeopleScreen";
import VoiceScreen from "./components/Screens/VoiceScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ role }) {
  const canEdit = role === "caregiver"; // caregivers can edit the safe zone
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: { height: 60 },
        tabBarIcon: ({ color, focused }) => {
          const size = focused ? 26 : 22;
          if (route.name === "Home") return <Ionicons name="home" size={size} color={color} />;
          if (route.name === "Map") return <Ionicons name="map" size={size} color={color} />;
          if (route.name === "People") return <Ionicons name="people" size={size} color={color} />;
          if (route.name === "Voice") return <Ionicons name="mic" size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Pass canEdit to MapScreen */}
      <Tab.Screen
        name="Map"
        component={MapScreen}
        initialParams={{ canEdit }}
      />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Voice" component={VoiceScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [phase, setPhase] = useState("splash"); // 'splash' | 'role' | 'loading' | 'main'
  const [role, setRole] = useState(null);       // 'caregiver' | 'user'

  useEffect(() => {
    const timer = setTimeout(() => setPhase("role"), 2000); // show splash 2s
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (pickedRole) => {
    setRole(pickedRole);       // save which role was chosen
    setPhase("loading");       // show quick loading
    setTimeout(() => setPhase("main"), 800);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {phase === "splash" && (
          <Stack.Screen name="Splash" component={SplashScreen} />
        )}

        {phase === "role" && (
          <Stack.Screen name="Role">
            {(props) => (
              <RoleSelectScreen
                {...props}
                onSelectRole={handleRoleSelect}
              />
            )}
          </Stack.Screen>
        )}

        {phase === "loading" && (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        )}

        {phase === "main" && (
          <Stack.Screen name="MainTabs">
            {() => <MainTabs role={role} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
