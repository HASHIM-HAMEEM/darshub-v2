import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.tint }]}>{title}</Text><View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View></View>;
}

export function TextField({ label, value, onChangeText, placeholder, multiline = false, required = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; multiline?: boolean; required?: boolean }) {
  const colors = useColors();
  return <View style={styles.field}><Text style={[styles.label, { color: colors.text }]}>{label}{required ? <Text style={{ color: colors.error }}> *</Text> : null}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} style={[styles.input, multiline ? styles.textarea : null, { color: colors.text, borderColor: colors.border }]} returnKeyType={multiline ? "default" : "done"} /></View>;
}

export function PickerField({ label, value, options, onSelect, placeholder = "Select" }: { label: string; value: string; options: { label: string; value: string }[]; onSelect: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={styles.field}><Text style={[styles.label, { color: colors.text }]}>{label}</Text><OptionPicker value={value} options={options} onSelect={onSelect} placeholder={placeholder} /></View>;
}

export function OptionPicker({ value, options, onSelect, placeholder = "Select" }: { value: string; options: { label: string; value: string }[]; onSelect: (value: string) => void; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  const colors = useColors();
  const display = options.find((option) => option.value === value)?.label ?? placeholder;
  return <><Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.picker, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}><Text numberOfLines={1} style={[styles.pickerText, { color: value ? colors.text : colors.muted }]}>{display}</Text><MaterialIcons name="unfold-more" size={19} color={colors.muted} /></Pressable><Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}><Pressable onPress={() => setVisible(false)} style={styles.modalShade}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.background }]}><Text style={[styles.modalTitle, { color: colors.text }]}>{placeholder}</Text><ScrollView>{options.map((option) => <Pressable key={option.value} onPress={() => { onSelect(option.value); setVisible(false); }} style={({ pressed }) => [styles.option, { borderBottomColor: colors.border, backgroundColor: value === option.value ? colors.surface : "transparent", opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>{value === option.value ? <MaterialIcons name="check" size={20} color={colors.tint} /> : null}</Pressable>)}</ScrollView></Pressable></Pressable></Modal></>;
}

const styles = StyleSheet.create({
  section: { gap: 8, marginBottom: 19 }, sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.75, marginLeft: 3, textTransform: "uppercase" }, sectionBody: { borderRadius: 20, borderWidth: 1, gap: 14, padding: 15 }, field: { gap: 7 }, label: { fontSize: 13, fontWeight: "700" }, input: { borderRadius: 13, borderWidth: 1, fontSize: 15, minHeight: 46, paddingHorizontal: 13, paddingVertical: 11 }, textarea: { minHeight: 92, textAlignVertical: "top" }, picker: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 46, paddingHorizontal: 13 }, pickerText: { flex: 1, fontSize: 15 }, modalShade: { alignItems: "center", backgroundColor: "rgba(17, 24, 22, 0.38)", flex: 1, justifyContent: "center", padding: 24 }, modalCard: { borderRadius: 24, maxHeight: "72%", overflow: "hidden", width: "100%" }, modalTitle: { fontSize: 18, fontWeight: "800", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }, option: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 20 }, optionText: { fontSize: 15, fontWeight: "600" },
});
