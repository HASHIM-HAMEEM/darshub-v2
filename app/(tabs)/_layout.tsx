import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 9 : Math.max(insets.bottom, 8); const tabBarHeight = 59 + bottomPadding;
  return <Tabs screenOptions={{ tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, headerShown: false, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 1 }, tabBarStyle: { paddingTop: 7, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, elevation: 0, shadowOpacity: 0 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="home" color={color} /> }} />
    <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="calendar-today" color={color} /> }} />
    <Tabs.Screen name="add" options={{ title: "Add", tabBarIcon: () => <View style={[styles.addIcon, { backgroundColor: colors.tint }]}><MaterialIcons name="add" size={20} color={colors.background} /></View> }} />
    <Tabs.Screen name="teachers" options={{ title: "Teachers", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="groups" color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="menu" color={color} /> }} />
  </Tabs>;
}

const styles = StyleSheet.create({ addIcon: { alignItems: "center", borderRadius: 20, height: 37, justifyContent: "center", marginTop: -8, width: 37 } });
