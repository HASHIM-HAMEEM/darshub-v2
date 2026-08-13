import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, IconButton, ScreenTitle, SubjectBadge } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { goBackOrHome } from "@/lib/navigation";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const colors = useColors(); const { books, classes, teachers, locations } = useDars(); const book = books.find((item) => item.id === id); const linked = classes.filter((item) => item.bookId === id);
  if (!book) return <ScreenContainer><EmptyState title="Book not found" message="This text is no longer in your library." actionLabel="Back to books" onAction={() => router.replace("/books" as never)} /></ScreenContainer>;
  return <ScreenContainer><FlatList data={linked} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Study text" title={book.name} action={<IconButton icon="close" label="Close book" onPress={goBackOrHome} />} /><View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.author, { color: colors.muted }]}>{book.author}</Text><SubjectBadge label={book.subject} />{book.studyStatus ? <Text style={[styles.status, { color: colors.tint }]}>{book.studyStatus}</Text> : null}{book.description ? <Text style={[styles.description, { color: colors.text }]}>{book.description}</Text> : null}</View><Text style={[styles.heading, { color: colors.text }]}>Linked classes</Text></View>} ListEmptyComponent={<EmptyState icon="menu-book" title="No linked classes" message="Classes studying this book will appear here." />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 36 }, header: { gap: 16, paddingBottom: 8 }, hero: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 10, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, author: { fontSize: 14, fontWeight: "500" }, status: { fontSize: 11, fontWeight: "600", letterSpacing: 0.45, textTransform: "uppercase" }, description: { fontSize: 13.5, lineHeight: 20 }, heading: { fontSize: 14, fontWeight: "600", marginTop: 2 }, item: { marginTop: 12 } });
