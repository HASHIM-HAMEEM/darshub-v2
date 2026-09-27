import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { radius } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

function TabIcon({ active, idle, color, focused, indicator }: { active: IconName; idle: IconName; color: string; focused: boolean; indicator: string }) {
  return (
    <View style={[styles.indicator, focused && { backgroundColor: indicator }]}>
      <MaterialIcons name={focused ? active : idle} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 8 : Math.max(insets.bottom, 8);
  const icon = (active: IconName, idle: IconName) =>
    function Icon({ color, focused }: { color: string; focused: boolean }) {
      return <TabIcon active={active} idle={idle} color={color} focused={focused} indicator={colors.wash} />;
    };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: "transparent",
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [
          styles.bar,
          { height: 68 + bottomPadding, paddingBottom: bottomPadding, backgroundColor: colors.surface, borderTopColor: colors.border },
        ],
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: icon("home-filled", "home") }} />
      <Tabs.Screen name="schedule" options={{ title: t("schedule"), tabBarIcon: icon("event", "calendar-today") }} />
      <Tabs.Screen
        name="library"
        options={{ title: language === "ar" ? "المكتبة" : "Library", tabBarIcon: icon("bookmark", "bookmark-border") }}
      />
      <Tabs.Screen name="search" options={{ title: language === "ar" ? "البحث" : "Search", tabBarIcon: icon("search", "search") }} />
      <Tabs.Screen name="more" options={{ title: t("more"), tabBarIcon: icon("settings", "tune") }} />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="teachers" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, paddingHorizontal: 4, paddingTop: 10, shadowOpacity: 0 },
  item: { gap: 4 },
  indicator: { alignItems: "center", borderRadius: radius.pill, height: 30, justifyContent: "center", width: 58 },
  label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.1, marginTop: 2 },
});
