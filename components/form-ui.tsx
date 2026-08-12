import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  return <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text><View style={[styles.sectionBody, { borderTopColor: colors.border }]}>{children}</View></View>;
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
  const [visible, setVisible] = useState(false); const colors = useColors(); const display = options.find((option) => option.value === value)?.label ?? placeholder;
  return <><Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.picker, { borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><Text numberOfLines={1} style={[styles.pickerText, { color: value ? colors.text : colors.muted }]}>{display}</Text><MaterialIcons name="keyboard-arrow-down" size={20} color={colors.muted} /></Pressable><Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}><Pressable onPress={() => setVisible(false)} style={styles.modalShade}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.background }]}><Text style={[styles.modalTitle, { color: colors.text }]}>{placeholder}</Text><ScrollView>{options.map((option) => <Pressable key={option.value} onPress={() => { onSelect(option.value); setVisible(false); }} style={({ pressed }) => [styles.option, { borderBottomColor: colors.border, backgroundColor: value === option.value ? "#EEF2E9" : "transparent", opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>{value === option.value ? <MaterialIcons name="check" size={20} color={colors.tint} /> : null}</Pressable>)}</ScrollView></Pressable></Pressable></Modal></>;
}

const styles = StyleSheet.create({
  section: { borderRadius: 15, borderWidth: 1, marginBottom: 18, overflow: "hidden" }, sectionTitle: { fontSize: 14, fontWeight: "800", paddingHorizontal: 15, paddingVertical: 14 }, sectionBody: { borderTopWidth: 1, gap: 14, padding: 15 }, field: { gap: 7 }, label: { fontSize: 12, fontWeight: "700" }, input: { borderRadius: 9, borderWidth: 1, fontSize: 14, minHeight: 43, paddingHorizontal: 12, paddingVertical: 9 }, textarea: { minHeight: 86, textAlignVertical: "top" }, picker: { alignItems: "center", borderRadius: 9, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 43, paddingHorizontal: 12 }, pickerText: { flex: 1, fontSize: 14 }, modalShade: { alignItems: "center", backgroundColor: "rgba(17,35,28,0.34)", flex: 1, justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "72%", overflow: "hidden", paddingTop: 8, width: "100%" }, modalTitle: { fontSize: 18, fontWeight: "800", paddingHorizontal: 20, paddingVertical: 16 }, option: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 54, paddingHorizontal: 20 }, optionText: { fontSize: 15, fontWeight: "600" },
});
