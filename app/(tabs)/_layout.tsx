import { router, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";

function TabIcon({ name, color, focused }: { name: React.ComponentProps<typeof MaterialIcons>["name"]; color: string; focused: boolean }) { return <MaterialIcons name={name} size={focused ? 22 : 21} color={color} />; }

export default function TabLayout() {
  const colors = useColors(); const { t } = useI18n(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 10); const tabBarHeight = 64 + bottomPadding;
  return <Tabs screenOptions={{ headerShown: false, tabBarButton: HapticTab, tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, tabBarActiveBackgroundColor: "transparent", tabBarLabelStyle: styles.label, tabBarItemStyle: styles.item, tabBarStyle: [styles.bar, { height: tabBarHeight, paddingBottom: bottomPadding, backgroundColor: colors.surface, borderTopColor: colors.border }] }}>
    <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} /> }} />
    <Tabs.Screen name="schedule" options={{ title: t("schedule"), tabBarIcon: ({ color, focused }) => <TabIcon name="calendar-today" color={color} focused={focused} /> }} />
    <Tabs.Screen name="add" listeners={{ tabPress: (event) => { event.preventDefault(); router.push("/class/form" as never); } }} options={{ title: t("add"), tabBarIcon: () => <View style={[styles.addCircle, { backgroundColor: colors.tint }]}><MaterialIcons name="add" size={20} color={colors.background} /></View> }} />
    <Tabs.Screen name="teachers" options={{ title: t("teachers"), tabBarIcon: ({ color, focused }) => <TabIcon name="groups" color={color} focused={focused} /> }} />
    <Tabs.Screen name="more" options={{ title: t("more"), tabBarIcon: ({ color, focused }) => <TabIcon name="more-horiz" color={color} focused={focused} /> }} />
  </Tabs>;
}

const styles = StyleSheet.create({ bar: { borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, paddingHorizontal: 4, paddingTop: 7 }, item: { borderRadius: 0, marginHorizontal: 2, marginTop: 0 }, label: { fontSize: 10, fontWeight: "700", letterSpacing: -0.1, marginTop: 2 }, addCircle: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", marginTop: -3, width: 36 } });
