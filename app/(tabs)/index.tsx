import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ClassCard, EmptyState, FilterChips, IconButton, ScreenTitle, SearchField } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { classMatchesQuery, dayDifference, getNextClass, getRef, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";

export default function HomeScreen() {
  const colors = useColors();
  const { classes, teachers, books, locations } = useDars();
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("Today");
  const upcoming = useMemo(() => getUpcomingClasses(classes), [classes]);
  const nextClass = getNextClass(classes);
  const visible = useMemo(() => upcoming.filter((item) => {
    const distance = dayDifference(item.date);
    const matchesRange = range === "Today" ? distance === 0 : range === "This Week" ? distance >= 0 && distance <= 7 : true;
    return matchesRange && classMatchesQuery(item, { teachers, books, locations }, search);
  }), [books, locations, range, search, teachers, upcoming]);

  const header = <View style={styles.header}><ScreenTitle eyebrow="Your study rhythm" title="As-salamu alaykum" action={<IconButton icon="add" label="Add a class" tone="primary" onPress={() => router.push("/class/form" as never)} />} />
    {nextClass ? <Pressable onPress={() => router.push(`/class/${nextClass.id}` as never)} style={({ pressed }) => [styles.nextClass, { backgroundColor: colors.tint, opacity: pressed ? 0.78 : 1 }]}><View style={styles.nextTop}><View><Text style={[styles.nextOverline, { color: colors.background }]}>NEXT DARS</Text><Text numberOfLines={1} style={[styles.nextTitle, { color: colors.background }]}>{nextClass.title}</Text></View><MaterialIcons name="arrow-forward" size={22} color={colors.background} /></View><Text numberOfLines={1} style={[styles.nextDetail, { color: colors.background }]}>{getRef(teachers, nextClass.teacherId)?.name} · {getRef(books, nextClass.bookId)?.name}</Text><View style={styles.nextMeta}><MaterialIcons name="schedule" size={16} color={colors.background} /><Text style={[styles.nextDetail, { color: colors.background }]}>{nextClass.startTime}</Text><View style={styles.nextDot} /><MaterialIcons name="location-on" size={16} color={colors.background} /><Text numberOfLines={1} style={[styles.nextDetail, { color: colors.background, flex: 1 }]}>{getRef(locations, nextClass.locationId)?.name}</Text></View></Pressable> : null}
    <View style={styles.searchBlock}><SearchField value={search} onChangeText={setSearch} /><FilterChips values={["Today", "This Week", "All"]} selected={range} onSelect={setRange} /></View>
    <View style={styles.listHeading}><Text style={[styles.listTitle, { color: colors.text }]}>{range === "Today" ? "Today’s classes" : range === "This Week" ? "This week" : "All upcoming"}</Text><Text style={[styles.count, { color: colors.muted }]}>{visible.length} planned</Text></View>
  </View>;

  return <ScreenContainer><FlatList data={visible} keyExtractor={(item) => item.id} renderItem={({ item }) => <ClassCard item={item} teachers={teachers} books={books} locations={locations} />} contentContainerStyle={styles.content} ListHeaderComponent={header} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} ListEmptyComponent={<EmptyState title="No classes here yet" message="Try a different filter or add your next dars." actionLabel="Add a class" onAction={() => router.push("/class/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120 }, header: { gap: 18, paddingTop: 2, paddingBottom: 18 }, nextClass: { borderRadius: 24, gap: 10, padding: 19 }, nextTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }, nextOverline: { fontSize: 11, fontWeight: "800", letterSpacing: 0.9, opacity: 0.82 }, nextTitle: { fontSize: 20, fontWeight: "800", lineHeight: 26, marginTop: 4, maxWidth: 290 }, nextDetail: { fontSize: 13, lineHeight: 18, opacity: 0.86 }, nextMeta: { alignItems: "center", flexDirection: "row", gap: 5 }, nextDot: { backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 2, height: 4, marginHorizontal: 4, width: 4 }, searchBlock: { gap: 11 }, listHeading: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between", marginTop: 2 }, listTitle: { fontSize: 18, fontWeight: "800" }, count: { fontSize: 12, fontWeight: "600" },
});
