import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HighlightBlob, Icon, SketchSurface } from "@/components/doodle";
import { fonts, handFont } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const tabIcons: Record<string, IconName> = {
  index: "home",
  schedule: "calendar-today",
  library: "bookmark",
  search: "search",
  more: "tune",
};

function TabItem({ focused, label, icon, onPress, onLongPress }: { focused: boolean; label: string; icon: IconName; onPress: () => void; onLongPress: () => void }) {
  const colors = useColors();
  const lift = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    lift.value = focused ? withSequence(withSpring(1.25, { damping: 6, stiffness: 420 }), withSpring(1, { damping: 10 })) : withSpring(0, { damping: 14 });
  }, [focused, lift]);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -3 * lift.value }, { scale: 1 + 0.08 * lift.value }, { rotate: `${-6 * lift.value}deg` }] }));
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <View style={styles.blobSlot}>
        <HighlightBlob width={58} height={30} active={focused} />
      </View>
      <Animated.View style={iconStyle}>
        <Icon name={icon} size={25} color={focused ? colors.line : colors.muted} strokeWidth={focused ? 2.3 : 1.9} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, { color: focused ? colors.onHighlight : colors.muted, fontFamily: focused ? handFont(label) : fonts.bold, fontSize: focused ? (handFont(label) === fonts.hand ? 17 : 13) : 11 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function DoodleTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useI18n();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 10);
  const routes = state.routes.filter((route) => tabIcons[route.name]);
  return (
    <View pointerEvents="box-none" style={[styles.dock, { bottom }]}>
      <SketchSurface corner={26} seed={11} fill={colors.surface} style={[styles.bar, isRTL && styles.rowReverse]}>
        {routes.map((route) => {
          const focused = state.routes[state.index]?.key === route.key;
          const options = descriptors[route.key]?.options;
          const label = typeof options?.title === "string" ? options.title : route.name;
          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              icon={tabIcons[route.name]}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptic.selection();
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            />
          );
        })}
      </SketchSurface>
    </View>
  );
}

export default function TabLayout() {
  const { t, language } = useI18n();
  return (
    <Tabs tabBar={(props) => <DoodleTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t("home") }} />
      <Tabs.Screen name="schedule" options={{ title: t("schedule") }} />
      <Tabs.Screen name="library" options={{ title: language === "ar" ? "المكتبة" : "Library" }} />
      <Tabs.Screen name="search" options={{ title: language === "ar" ? "البحث" : "Search" }} />
      <Tabs.Screen name="more" options={{ title: t("more") }} />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="teachers" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dock: { left: 14, position: "absolute", right: 14 },
  bar: { flexDirection: "row", height: 66, paddingHorizontal: 4, paddingVertical: 6 },
  rowReverse: { flexDirection: "row-reverse" },
  item: { alignItems: "center", flex: 1, gap: 1, justifyContent: "center" },
  blobSlot: { alignItems: "center", height: 30, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 22 },
  label: { lineHeight: 18 },
});
