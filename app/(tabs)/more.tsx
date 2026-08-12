import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { DirectoryRow, ScreenTitle } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoreScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { books, locations } = useDars();
  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} showsVerticalScrollIndicator={false}><ScreenTitle title="More" /><Text style={[styles.sectionLabel, { color: colors.muted }]}>STUDY LIBRARY</Text><View><DirectoryRow icon="menu-book" title="Books" subtitle={`${books.length} books`} onPress={() => router.push("/books" as never)} /><DirectoryRow icon="location-on" title="Locations" subtitle={`${locations.length} places`} onPress={() => router.push("/locations" as never)} /><DirectoryRow icon="search" title="Search & Filter" subtitle="Find a class" onPress={() => router.push("/search" as never)} /></View><Text style={[styles.sectionLabel, { color: colors.muted }]}>APP</Text><View><DirectoryRow icon="settings" title="Settings" subtitle="Theme and local data" onPress={() => router.push("/settings" as never)} /></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingTop: 6 }, sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, marginBottom: 9, marginTop: 15 } });
