// App.js
import * as React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

// ---- Your custom nav icon components (clickable + navigate themselves)
import HomeNav from "./components/Navigation/Home";
import MapNav from "./components/Navigation/Map";
import PeopleNav from "./components/Navigation/People";
import VoiceNav from "./components/Navigation/Voice";

// ---- Your screens
import HomeScreen from "./Screens/HomeScreen";
import MapScreen from "./Screens/MapScreen";
import PeopleScreen from "./Screens/PeopleScreen";
import VoiceScreen from "./Screens/VoiceScreen";

// If you don't have these yet, create simple placeholders:
// export default function HomeScreen(){ return <View><Text>Home</Text></View> }

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  // You can still access navigation via props.navigation, but
  // your icon components already navigate themselves via useNavigation()
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScroll}
    >
      <SafeAreaView style={styles.drawerSafe}>
        <View style={styles.drawerItems}>
          <HomeNav />
          <MapNav />
          <PeopleNav />
          <VoiceNav />
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitleAlign: "center",
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Map" component={MapScreen} />
        <Drawer.Screen name="People" component={PeopleScreen} />
        <Drawer.Screen name="Voice" component={VoiceScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerScroll: { flex: 1 },
  drawerSafe: { flex: 1, paddingVertical: 12 },
  drawerItems: {
    gap: 6,
    paddingHorizontal: 12,
  },
});
