import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8); const tabBarHeight = 58 + bottomPadding;
  return <Tabs screenOptions={{ tabBarActiveTintColor: colors.text, tabBarInactiveTintColor: colors.muted, headerShown: false, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 10, fontWeight: "600" }, tabBarStyle: { paddingTop: 7, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5, elevation: 0, shadowOpacity: 0 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="home" color={color} /> }} />
    <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: ({ color }) => <MaterialIcons size={21} name="calendar-today" color={color} /> }} />
    <Tabs.Screen name="add" options={{ title: "New", tabBarIcon: ({ color }) => <MaterialIcons size={23} name="add" color={color} /> }} />
    <Tabs.Screen name="teachers" options={{ title: "Teachers", tabBarIcon: ({ color }) => <MaterialIcons size={21} name="person-outline" color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <MaterialIcons size={22} name="more-horiz" color={color} /> }} />
  </Tabs>;
}
