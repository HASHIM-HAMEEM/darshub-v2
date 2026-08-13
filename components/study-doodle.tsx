import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const doodleSource = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663105249869/PiGgphxmTqHywnKN.png";

export function StudyDoodle({ size = 72 }: { size?: number }) {
  return <View style={[styles.frame, { height: size, width: size }]}><Image source={{ uri: doodleSource }} contentFit="contain" transition={180} style={styles.image} accessibilityLabel="Study journal illustration" /></View>;
}

const styles = StyleSheet.create({ frame: { alignItems: "center", justifyContent: "center" }, image: { height: "100%", width: "100%" } });
