import { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

const arabicLogoUri = "/manus-storage/darshub-arabic-logo_e7eb7d88.png";

export function BrandIntro() {
  const colors = useColors(); const [visible, setVisible] = useState(Platform.OS !== "web"); const opacity = useRef(new Animated.Value(1)).current; const scale = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    if (!visible) return;
    Animated.sequence([
      Animated.spring(scale, { damping: 15, stiffness: 155, mass: 0.75, toValue: 1, useNativeDriver: true }),
      Animated.delay(260),
      Animated.timing(opacity, { duration: 280, toValue: 0, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [opacity, scale, visible]);
  if (!visible) return null;
  return <Animated.View pointerEvents="none" style={[styles.overlay, { backgroundColor: colors.background, opacity }]}><View style={[styles.mark, { backgroundColor: colors.wash }]}><Image accessibilityLabel="DarsHub Arabic logo" source={{ uri: arabicLogoUri }} style={[styles.image, { transform: [{ scale }] }]} /></View></Animated.View>;
}

const styles = StyleSheet.create({ overlay: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0, zIndex: 50 }, mark: { alignItems: "center", borderRadius: 34, height: 136, justifyContent: "center", width: 136 }, image: { height: 98, resizeMode: "contain", width: 98 } });
