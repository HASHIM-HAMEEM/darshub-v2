import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { DirectoryRow, ScreenTitle } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";

export default function MoreScreen() {
  const colors = useColors();
  const { books, locations } = useDars();
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><ScreenTitle eyebrow="Your study library" title="More" /><View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><DirectoryRow icon="menu-book" title="Books" subtitle={`${books.length} texts in your library`} onPress={() => router.push("/books" as never)} /><DirectoryRow icon="location-on" title="Locations" subtitle={`${locations.length} places for classes`} onPress={() => router.push("/locations" as never)} /><DirectoryRow icon="filter-list" title="Search & filter" subtitle="Find classes by detail" onPress={() => router.push("/search" as never)} /></View><Text style={[styles.groupLabel, { color: colors.tint }]}>Preferences</Text><View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><DirectoryRow icon="settings" title="Settings" subtitle="Theme, reminders, language" onPress={() => router.push("/settings" as never)} /></View><Text style={[styles.footer, { color: colors.muted }]}>DarsHub helps you keep your classes close and your study rhythm clear.</Text></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 120 }, group: { borderRadius: 20, borderWidth: 1, marginTop: 2, overflow: "hidden", paddingHorizontal: 14 }, groupLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.75, marginBottom: 8, marginLeft: 3, marginTop: 24, textTransform: "uppercase" }, footer: { fontSize: 13, lineHeight: 20, marginHorizontal: 7, marginTop: 28, textAlign: "center" } });
