import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;

  return <Tabs screenOptions={{
    tabBarActiveTintColor: colors.tint,
    tabBarInactiveTintColor: colors.muted,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
    tabBarStyle: {
      paddingTop: 8,
      paddingBottom: bottomPadding,
      height: tabBarHeight,
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      borderTopWidth: 0.5,
    },
  }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <MaterialIcons size={25} name="home-filled" color={color} /> }} />
    <Tabs.Screen name="schedule" options={{ title: "Schedule", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="calendar-month" color={color} /> }} />
    <Tabs.Screen name="add" options={{ title: "Add", tabBarIcon: ({ color }) => <MaterialIcons size={27} name="add-circle" color={color} /> }} />
    <Tabs.Screen name="teachers" options={{ title: "Teachers", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="school" color={color} /> }} />
    <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color }) => <MaterialIcons size={24} name="more-horiz" color={color} /> }} />
  </Tabs>;
}
