import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const colors = useColors(); const { t } = useI18n(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 9 : Math.max(insets.bottom, 8); const tabBarHeight = 62 + bottomPadding;
  return <Tabs screenOptions={{ tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, headerShown: false, tabBarButton: HapticTab, tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 }, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, elevation: 0, shadowOpacity: 0 } }}>
    <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color }) => <MaterialIcons size={22} name="home" color={color} /> }} />
    <Tabs.Screen name="schedule" options={{ title: t("schedule"), tabBarIcon: ({ color }) => <MaterialIcons size={21} name="calendar-today" color={color} /> }} />
    <Tabs.Screen name="add" options={{ title: t("add"), tabBarIcon: ({ color }) => <MaterialIcons name="add" size={23} color={color} /> }} />
    <Tabs.Screen name="teachers" options={{ title: t("teachers"), tabBarIcon: ({ color }) => <MaterialIcons size={22} name="groups" color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: t("more"), tabBarIcon: ({ color }) => <MaterialIcons size={22} name="more-horiz" color={color} /> }} />
  </Tabs>;
}
