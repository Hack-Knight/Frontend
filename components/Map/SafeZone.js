// components/Map/SafeZone.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Circle } from "react-native-maps";

export default function SafeZone({
  center,
  radius,
  coords,
  bufferM = 10,
  onExit,
  onEnter,
  showCenterMarker = true,
  circleColors = {
    stroke: "rgba(66,133,244,0.9)",
    fill: "rgba(66,133,244,0.15)",
  },
}) {
  const [isOutside, setIsOutside] = useState(false);
  const lastStateRef = useRef(null);
  const debounceRef = useRef(null);

  const centerLatLng = useMemo(
    () => (center ? { latitude: center.lat, longitude: center.lng } : null),
    [center]
  );

  const distanceM = useMemo(() => {
    if (!coords || !center) return null;
    const R = 6371e3;
    const φ1 = (coords.latitude * Math.PI) / 180;
    const φ2 = (center.lat * Math.PI) / 180;
    const Δφ = ((center.lat - coords.latitude) * Math.PI) / 180;
    const Δλ = ((center.lng - coords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [coords, center]);

  useEffect(() => {
    if (distanceM == null || !radius) return;
    const outsideNow = distanceM > radius + bufferM;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (lastStateRef.current === null) {
        lastStateRef.current = outsideNow;
        setIsOutside(outsideNow);
        return;
      }
      if (!lastStateRef.current && outsideNow) onExit?.(distanceM);
      if (lastStateRef.current && !outsideNow) onEnter?.(distanceM);
      lastStateRef.current = outsideNow;
      setIsOutside(outsideNow);
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [distanceM, radius, bufferM, onExit, onEnter]);

  if (!centerLatLng) return null;

  return (
    <>
      <Circle
        center={centerLatLng}
        radius={radius}
        strokeColor={circleColors.stroke}
        fillColor={circleColors.fill}
        strokeWidth={2}
      />
      {showCenterMarker && (
        <Marker coordinate={centerLatLng} title="Safe Zone Center" />
      )}
    </>
  );
}
