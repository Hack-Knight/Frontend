
import 'dotenv/config';

export default {
  expo: {
    name: "SafeCircle",
    slug: "SafeCircle",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "SafeCircle uses your location to show your live position and ensure you stay within your safety zone."
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS
      }
    },
    android: {
      adaptiveIcon: { backgroundColor: "#ffffff" },
      package: "com.safecircle.app",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      config: {
        googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID }
      }
    },
    plugins: ["expo-asset", "expo-font", "expo-location"],
    extra: { eas: { projectId: "1234" } }
  }
};
