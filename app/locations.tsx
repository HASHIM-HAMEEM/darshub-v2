import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LocationsScreen() {
  const { locations, classes } = useDars(); const { language } = useI18n(); const insets = useSafeAreaInsets(); const list = useMemo(() => [...locations].sort((a, b) => a.name.localeCompare(b.name)), [locations]); const countLabel = (count: number) => language === "ar" ? `${count} دروس` : `${count} ${count === 1 ? "class" : "classes"}`;
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle title={language === "ar" ? "الأماكن" : "Locations"} action={<IconButton icon="add" label={language === "ar" ? "أضف مكاناً" : "Add location"} onPress={() => router.push("/location/form" as never)} />} /></View>} renderItem={({ item }) => <DirectoryRow icon="location-on" title={item.name} subtitle={[item.area, item.city].filter(Boolean).join(" · ")} tag={countLabel(classes.filter((entry) => entry.locationId === item.id).length)} onPress={() => router.push(`/location/${item.id}` as never)} />} ListEmptyComponent={<EmptyState icon="location-on" title={language === "ar" ? "لا توجد أماكن" : "No locations found"} message={language === "ar" ? "أضف مكاناً لإقامة الدروس." : "Add a class location to begin."} actionLabel={language === "ar" ? "أضف مكاناً" : "Add location"} onAction={() => router.push("/location/form" as never)} />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, header: { marginBottom: 1 } });
