import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle, SearchField } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";

export default function LocationsScreen() {
  const { locations } = useDars(); const [query, setQuery] = useState(""); const list = useMemo(() => locations.filter((location) => `${location.name} ${location.city} ${location.area}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [locations, query]);
  return <ScreenContainer><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Where you gather" title="Locations" action={<IconButton icon="add" label="Add location" tone="primary" onPress={() => router.push("/location/form" as never)} />} /><SearchField value={query} onChangeText={setQuery} placeholder="Search places, cities, areas" /></View>} renderItem={({ item }) => <DirectoryRow icon="location-on" title={item.name} subtitle={`${item.area} · ${item.city}`} onPress={() => router.push(`/location/${item.id}` as never)} />} ListEmptyComponent={<EmptyState icon="location-on" title="No locations found" message="Try another search, or add a class location." actionLabel="Add location" onAction={() => router.push("/location/form" as never)} />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { gap: 16, marginBottom: 5 } });
