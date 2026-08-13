import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type DoodleName = "home" | "calendar" | "add" | "teachers" | "more";
const sources: Record<Exclude<DoodleName, "home">, string> = { calendar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663105249869/PiGgphxmTqHywnKN.png", add: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663105249869/XKHVuZhlcfqhhLUv.png", teachers: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663105249869/pdPWoBcpufmqckwA.png", more: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663105249869/GUyuftWdsoheMlsq.png" };

export function DoodleNavIcon({ name, color }: { name: DoodleName; color: string }) { if (name === "home") return <MaterialIcons name="home" size={22} color={color} />; return <Image source={{ uri: sources[name] }} contentFit="contain" transition={180} style={[styles.icon, { tintColor: color }]} accessibilityLabel="" />; }

const styles = StyleSheet.create({ icon: { height: 24, width: 24 } });
