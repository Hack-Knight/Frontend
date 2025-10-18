// hooks/useGeolocation.js
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";

export default function useGeolocation({
  highAccuracy = true,
  intervalMs = 3000,
  distanceM = 1,
} = {}) {
  const [coords, setCoords] = useState(null);     // { latitude, longitude, accuracy, ... }
  const [error, setError] = useState(null);
  const [granted, setGranted] = useState(false);
  const watchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Ask for foreground permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) setError("Location permission not granted");
          return;
        }
        if (!cancelled) setGranted(true);

        // Initial location
        const current = await Location.getCurrentPositionAsync({
          accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        });
        if (!cancelled) setCoords(current.coords);

        // Subscribe to updates
        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
            timeInterval: intervalMs,   // ms between updates (may not be exact)
            distanceInterval: distanceM // meters moved before update
          },
          (update) => {
            if (!cancelled) setCoords(update.coords);
          }
        );
      } catch (e) {
        if (!cancelled) setError(e?.message || "Location error");
      }
    })();

    return () => {
      cancelled = true;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [highAccuracy, intervalMs, distanceM]);

  return { coords, error, granted };
}
