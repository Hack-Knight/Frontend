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

// Auth screens (make sure these files exist)

import LoginScreen from "./components/Screens/LoginScreen";
import SignupScreen from "./components/Screens/SignUp";



const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ role }) {
  const canEdit = role === "caregiver";
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
      <Tab.Screen name="Map" component={MapScreen} initialParams={{ canEdit }} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Voice" component={VoiceScreen} />
    </Tab.Navigator>
  );
}

function AuthFlow({ onAuthed }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Start at Signup first */}
      <AuthStack.Screen name="Signup">
        {(props) => <SignupScreen {...props} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} />}
      </AuthStack.Screen>
      {/* After successful signup/login, navigate to Role in the RootStack: */}
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [phase, setPhase] = useState("splash"); // 'splash' | 'auth' | 'role' | 'loading' | 'main'
  const [role, setRole] = useState(null);       // 'caregiver' | 'user'

  useEffect(() => {
    const t = setTimeout(() => setPhase("auth"), 1200); // splash → auth
    return () => clearTimeout(t);
  }, []);

  const handleAuthed = () => setPhase("role"); // call this after signup/login
  const handleRoleSelect = (pickedRole) => {
    setRole(pickedRole);
    setPhase("loading");
    setTimeout(() => setPhase("main"), 800);
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {phase === "splash" && (
          <RootStack.Screen name="Splash" component={SplashScreen} />
        )}

        {phase === "auth" && (
          <RootStack.Screen name="AuthFlow">
            {(props) => <AuthFlow {...props} onAuthed={handleAuthed} />}
          </RootStack.Screen>
        )}

        {phase === "role" && (
          <RootStack.Screen name="Role">
            {(props) => (
              <RoleSelectScreen
                {...props}
                onSelectRole={handleRoleSelect}
              />
            )}
          </RootStack.Screen>
        )}

        {phase === "loading" && (
          <RootStack.Screen name="Loading" component={LoadingScreen} />
        )}

        {phase === "main" && (
          <RootStack.Screen name="MainTabs">
            {() => <MainTabs role={role} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
