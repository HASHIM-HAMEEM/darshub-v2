import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.muted }]}>{title}</Text><View style={[styles.sectionBody, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>{children}</View></View>;
}

export function TextField({ label, value, onChangeText, placeholder, multiline = false, required = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; multiline?: boolean; required?: boolean }) {
  const colors = useColors();
  return <View style={[styles.field, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.text }]}>{label}{required ? <Text style={{ color: colors.error }}> *</Text> : null}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} style={[styles.input, multiline ? styles.textarea : null, { color: colors.text }]} returnKeyType={multiline ? "default" : "done"} /></View>;
}

export function PickerField({ label, value, options, onSelect, placeholder = "Select" }: { label: string; value: string; options: { label: string; value: string }[]; onSelect: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={[styles.field, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.text }]}>{label}</Text><OptionPicker value={value} options={options} onSelect={onSelect} placeholder={placeholder} /></View>;
}

export function OptionPicker({ value, options, onSelect, placeholder = "Select" }: { value: string; options: { label: string; value: string }[]; onSelect: (value: string) => void; placeholder?: string }) {
  const [visible, setVisible] = useState(false); const colors = useColors(); const display = options.find((option) => option.value === value)?.label ?? placeholder;
  return <><Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.picker, { opacity: pressed ? 0.52 : 1 }]}><Text numberOfLines={1} style={[styles.pickerText, { color: value ? colors.muted : colors.muted }]}>{display}</Text><MaterialIcons name="chevron-right" size={19} color={colors.muted} /></Pressable><Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}><Pressable onPress={() => setVisible(false)} style={styles.modalShade}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.modalTitle, { color: colors.text }]}>{placeholder}</Text><ScrollView>{options.map((option) => <Pressable key={option.value} onPress={() => { onSelect(option.value); setVisible(false); }} style={({ pressed }) => [styles.option, { borderBottomColor: colors.border, opacity: pressed ? 0.55 : 1 }]}><Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>{value === option.value ? <MaterialIcons name="check" size={19} color={colors.text} /> : null}</Pressable>)}</ScrollView></Pressable></Pressable></Modal></>;
}

const styles = StyleSheet.create({
  section: { marginBottom: 27 }, sectionTitle: { fontSize: 12, fontWeight: "600", marginBottom: 9 }, sectionBody: { borderBottomWidth: 1, borderTopWidth: 1 }, field: { borderBottomWidth: 1, gap: 5, minHeight: 62, paddingVertical: 11 }, label: { fontSize: 13, fontWeight: "600" }, input: { fontSize: 15, minHeight: 23, padding: 0 }, textarea: { minHeight: 72, paddingTop: 4, textAlignVertical: "top" }, picker: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 23 }, pickerText: { flex: 1, fontSize: 15 }, modalShade: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.36)", flex: 1, justifyContent: "flex-end" }, modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, maxHeight: "68%", overflow: "hidden", paddingTop: 12, width: "100%" }, modalTitle: { fontSize: 18, fontWeight: "600", paddingHorizontal: 20, paddingVertical: 14 }, option: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 54, paddingHorizontal: 20 }, optionText: { fontSize: 15, fontWeight: "500" },
});
