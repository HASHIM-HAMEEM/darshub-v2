import { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassCard, EmptyState, ScreenTitle, SearchField } from "@/components/dars-ui";
import { MotionPressable } from "@/components/motion-pressable";
import { OptionPicker } from "@/components/form-ui";
import { ScreenContainer } from "@/components/screen-container";
import { directional, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { classMatchesQuery, sortClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes, teachers, books, locations } = useDars();
  const { language, isRTL } = useI18n();
  const ar = language === "ar";
  const [query, setQuery] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [book, setBook] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("upcoming");

  const data = useMemo(() => {
    const matches = classes.filter(
      (item) =>
        classMatchesQuery(item, { teachers, books, locations }, query) &&
        (!teacher || item.teacherId === teacher) &&
        (!subject || item.subject === subject) &&
        (!book || item.bookId === book) &&
        (!location || item.locationId === location) &&
        (!city || item.city === city) &&
        (!status || item.status === status),
    );
    const sorted = sortClasses(matches);
    return status === "upcoming" ? sorted : sorted.reverse();
  }, [book, city, classes, location, query, status, subject, teacher, teachers, books, locations]);

  const subjects = useMemo(() => Array.from(new Set(classes.map((item) => item.subject))).sort(), [classes]);
  const cities = useMemo(() => Array.from(new Set([...locations.map((item) => item.city), ...classes.map((item) => item.city)].filter(Boolean))).sort(), [classes, locations]);
  const filtered = Boolean(query || teacher || subject || book || location || city || status !== "upcoming");
  const reset = () => {
    setQuery("");
    setTeacher("");
    setSubject("");
    setBook("");
    setLocation("");
    setCity("");
    setStatus("upcoming");
  };
  const all = (en: string, arabic: string) => ({ label: ar ? arabic : en, value: "" });

  const header = (
    <View style={styles.header}>
      <ScreenTitle title={ar ? "البحث" : "Search"} />
      <SearchField value={query} onChangeText={setQuery} placeholder={ar ? "ابحث بالعنوان أو المعلم أو الكتاب..." : "Title, teacher, book, place..."} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chips, isRTL && styles.rowReverse]}
        style={styles.chipScroll}
      >
        <OptionPicker
          variant="chip"
          title={ar ? "الحالة" : "Status"}
          placeholder={ar ? "كل الحالات" : "Any status"}
          value={status}
          onSelect={setStatus}
          options={[
            all("Any status", "كل الحالات"),
            { label: ar ? "قادم" : "Upcoming", value: "upcoming" },
            { label: ar ? "مكتمل" : "Completed", value: "completed" },
            { label: ar ? "ملغي" : "Cancelled", value: "cancelled" },
          ]}
        />
        <OptionPicker
          variant="chip"
          title={ar ? "المعلم" : "Teacher"}
          placeholder={ar ? "المعلم" : "Teacher"}
          value={teacher}
          onSelect={setTeacher}
          options={[all("All teachers", "كل المعلمين"), ...teachers.map((item) => ({ label: item.name, value: item.id }))]}
        />
        <OptionPicker
          variant="chip"
          title={ar ? "المادة" : "Subject"}
          placeholder={ar ? "المادة" : "Subject"}
          value={subject}
          onSelect={setSubject}
          options={[all("All subjects", "كل المواد"), ...subjects.map((item) => ({ label: item, value: item }))]}
        />
        <OptionPicker
          variant="chip"
          title={ar ? "الكتاب" : "Book"}
          placeholder={ar ? "الكتاب" : "Book"}
          value={book}
          onSelect={setBook}
          options={[all("All books", "كل الكتب"), ...books.map((item) => ({ label: item.name, value: item.id }))]}
        />
        <OptionPicker
          variant="chip"
          title={ar ? "المكان" : "Place"}
          placeholder={ar ? "المكان" : "Place"}
          value={location}
          onSelect={setLocation}
          options={[all("All places", "كل الأماكن"), ...locations.map((item) => ({ label: item.name, value: item.id }))]}
        />
        {cities.length > 1 ? (
          <OptionPicker
            variant="chip"
            title={ar ? "المدينة" : "City"}
            placeholder={ar ? "المدينة" : "City"}
            value={city}
            onSelect={setCity}
            options={[all("All cities", "كل المدن"), ...cities.map((item) => ({ label: item, value: item }))]}
          />
        ) : null}
      </ScrollView>
      <View style={[styles.resultRow, isRTL && styles.rowReverse]}>
        <Text style={[type.label, styles.flex, { color: colors.muted }, directional(isRTL)]}>
          {ar ? `${data.length} نتيجة` : `${data.length} ${data.length === 1 ? "result" : "results"}`}
        </Text>
        {filtered ? (
          <MotionPressable accessibilityRole="button" rippleBorderless hitSlop={10} onPress={reset}>
            <Text style={[type.label, { color: colors.tint }]}>{ar ? "مسح الكل" : "Clear all"}</Text>
          </MotionPressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + space.lg }]}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <ClassCard item={item} teachers={teachers} books={books} locations={locations} compact />}
        ListEmptyComponent={
          <EmptyState
            icon="search-off"
            title={ar ? "لا توجد نتائج" : "No results"}
            message={classes.length ? (ar ? "جرّب بحثاً أو تصفية مختلفة." : "Try a broader search or fewer filters.") : ar ? "أضف درساً للبدء." : "Add a class to get started."}
            actionLabel={filtered ? (ar ? "مسح التصفية" : "Clear filters") : undefined}
            onAction={filtered ? reset : undefined}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.gutter, paddingTop: space.sm },
  flex: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  header: { gap: space.md, paddingBottom: space.md },
  chipScroll: { marginHorizontal: -space.gutter },
  chips: { gap: space.sm, paddingHorizontal: space.gutter },
  resultRow: { alignItems: "center", flexDirection: "row", minHeight: 28 },
  separator: { height: space.sm },
});
