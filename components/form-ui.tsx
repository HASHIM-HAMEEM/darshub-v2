import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotionPressable, pressedOpacity } from "@/components/motion-pressable";
import { directional, radius, space, touchTarget, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <View style={styles.section}>
      <Text style={[type.label, { color: colors.muted }, directional(isRTL)]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <Text style={[type.meta, styles.label, { color: colors.text }, directional(isRTL)]}>
      {label}
      {required ? <Text style={{ color: colors.error }}> *</Text> : null}
    </Text>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  required = false,
  keyboardType = "default",
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: "default" | "url";
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        accessibilityLabel={label}
        selectionColor={colors.tint}
        cursorColor={colors.tint}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? (keyboardType === "url" ? "none" : "sentences")}
        autoCorrect={keyboardType !== "url"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          type.body,
          styles.input,
          multiline && styles.textarea,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.tint : colors.border,
            borderWidth: focused ? 1.5 : 1,
          },
          directional(isRTL),
        ]}
        returnKeyType={multiline ? "default" : "done"}
      />
    </View>
  );
}

function FieldTrigger({
  label,
  display,
  placeholder,
  icon,
  onPress,
}: {
  label: string;
  display?: string;
  placeholder: string;
  icon: MaterialIcon;
  onPress: () => void;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${display ?? placeholder}`}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.picker,
        isRTL && styles.rowReverse,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressedOpacity(pressed) },
      ]}
    >
      <Text numberOfLines={1} style={[type.body, styles.flex, { color: display ? colors.text : colors.muted }, directional(isRTL)]}>
        {display ?? placeholder}
      </Text>
      <MaterialIcons name={icon} size={20} color={colors.muted} />
    </MotionPressable>
  );
}

export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  const insets = useSafeAreaInsets();
  const closeLabel = language === "ar" ? "إغلاق" : "Close";
  return (
    <Modal transparent visible={visible} animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.shade}>
        <Pressable accessibilityLabel={closeLabel} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={[styles.sheetHeader, isRTL && styles.rowReverse]}>
            <Text style={[type.title, styles.flex, { color: colors.text }, directional(isRTL)]}>{title}</Text>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              rippleBorderless
              hitSlop={8}
              style={[styles.close, { backgroundColor: colors.subtle }]}
            >
              <MaterialIcons name="close" size={20} color={colors.text} />
            </MotionPressable>
          </View>
          {children}
          {footer ? <View style={[styles.sheetFooter, isRTL && styles.rowReverse]}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

function SheetButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  const colors = useColors();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: primary ? "rgba(255,255,255,0.18)" : colors.border, foreground: true }}
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.sheetButton,
        { backgroundColor: primary ? colors.tint : colors.subtle, opacity: pressedOpacity(pressed, 0.8) },
      ]}
    >
      <Text style={[type.bodyStrong, { color: primary ? colors.onPrimary : colors.text }]}>{label}</Text>
    </MotionPressable>
  );
}

export type SheetOption = { label: string; value: string; detail?: string; icon?: MaterialIcon };

export function OptionList({
  options,
  value,
  onSelect,
}: {
  options: SheetOption[];
  value?: string;
  onSelect: (value: string) => void;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <ScrollView bounces={false} contentContainerStyle={styles.optionList}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <MotionPressable
            key={option.value || "__empty"}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              haptic.selection();
              onSelect(option.value);
            }}
            style={({ pressed }) => [
              styles.option,
              isRTL && styles.rowReverse,
              { backgroundColor: active ? colors.wash : "transparent", opacity: pressedOpacity(pressed) },
            ]}
          >
            {option.icon ? <MaterialIcons name={option.icon} size={20} color={active ? colors.tint : colors.muted} /> : null}
            <View style={styles.flex}>
              <Text style={[active ? type.bodyStrong : type.body, { color: active ? colors.tint : colors.text }, directional(isRTL)]}>
                {option.label}
              </Text>
              {option.detail ? (
                <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{option.detail}</Text>
              ) : null}
            </View>
            {active ? <MaterialIcons name="check" size={20} color={colors.tint} /> : null}
          </MotionPressable>
        );
      })}
    </ScrollView>
  );
}

export function PickerField({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select",
  required = false,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <OptionPicker value={value} options={options} onSelect={onSelect} placeholder={placeholder} title={label} />
    </View>
  );
}

export function OptionPicker({
  value,
  options,
  onSelect,
  placeholder = "Select",
  title,
  variant = "field",
}: {
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
  title?: string;
  variant?: "field" | "chip";
}) {
  const [visible, setVisible] = useState(false);
  const colors = useColors();
  const { isRTL } = useI18n();
  const selected = options.find((option) => option.value === value);
  const close = () => setVisible(false);
  const sheetTitle = title ?? placeholder;
  const active = variant === "chip" && Boolean(value);
  return (
    <>
      {variant === "chip" ? (
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={`${sheetTitle}: ${selected?.label ?? placeholder}`}
          accessibilityState={{ selected: active }}
          onPress={() => {
            haptic.light();
            setVisible(true);
          }}
          style={({ pressed }) => [
            styles.chip,
            isRTL && styles.rowReverse,
            {
              backgroundColor: active ? colors.wash : colors.surface,
              borderColor: active ? colors.tint : colors.border,
              opacity: pressedOpacity(pressed),
            },
          ]}
        >
          <Text numberOfLines={1} style={[type.label, styles.chipText, { color: active ? colors.tint : colors.text }]}>
            {active ? selected?.label : placeholder}
          </Text>
          <MaterialIcons name="expand-more" size={18} color={active ? colors.tint : colors.muted} />
        </MotionPressable>
      ) : (
        <FieldTrigger
          label={sheetTitle}
          display={selected?.label}
          placeholder={placeholder}
          icon="unfold-more"
          onPress={() => setVisible(true)}
        />
      )}
      <BottomSheet visible={visible} title={sheetTitle} onClose={close}>
        <OptionList
          options={options}
          value={value}
          onSelect={(next) => {
            onSelect(next);
            close();
          }}
        />
      </BottomSheet>
    </>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseIso = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function DateField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  const { dateDisplay, locale } = useDisplayPreferences();
  const [visible, setVisible] = useState(false);
  const selected = parseIso(value);
  const [month, setMonth] = useState(() => selected ?? new Date());
  useEffect(() => {
    if (visible) setMonth(parseIso(value) ?? new Date());
  }, [visible, value]);
  const days = useMemo(() => monthGrid(month), [month]);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const weekdays = days.slice(0, 7).map((day) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(day));
  const todayIso = toIso(new Date());
  const shift = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
  const pick = (iso: string) => {
    haptic.selection();
    onChange(iso);
    setVisible(false);
  };
  const ar = language === "ar";
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <FieldTrigger
        label={label}
        display={selected ? formatClassDate(value, dateDisplay, locale) : undefined}
        placeholder={ar ? "اختر تاريخاً" : "Choose a date"}
        icon="calendar-today"
        onPress={() => setVisible(true)}
      />
      <BottomSheet
        visible={visible}
        title={label}
        onClose={() => setVisible(false)}
        footer={<SheetButton label={ar ? "اليوم" : "Today"} onPress={() => pick(todayIso)} />}
      >
        <View style={styles.calendar}>
          <View style={[styles.monthRow, isRTL && styles.rowReverse]}>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={ar ? "الشهر السابق" : "Previous month"}
              rippleBorderless
              onPress={() => shift(-1)}
              style={styles.monthNav}
            >
              <MaterialIcons name={isRTL ? "chevron-right" : "chevron-left"} size={24} color={colors.text} />
            </MotionPressable>
            <Text style={[type.headline, styles.monthLabel, { color: colors.text }]}>
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}
            </Text>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={ar ? "الشهر التالي" : "Next month"}
              rippleBorderless
              onPress={() => shift(1)}
              style={styles.monthNav}
            >
              <MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={24} color={colors.text} />
            </MotionPressable>
          </View>
          <View style={[styles.week, isRTL && styles.rowReverse]}>
            {weekdays.map((day, index) => (
              <Text key={index} style={[type.caption, styles.weekday, { color: colors.muted }]}>
                {day}
              </Text>
            ))}
          </View>
          {weeks.map((week, row) => (
            <View key={row} style={[styles.week, isRTL && styles.rowReverse]}>
              {week.map((day) => {
                const iso = toIso(day);
                const inMonth = day.getMonth() === month.getMonth();
                const isSelected = iso === value;
                const isToday = iso === todayIso;
                return (
                  <MotionPressable
                    key={iso}
                    accessibilityRole="button"
                    accessibilityLabel={formatClassDate(iso, "gregorian", locale)}
                    accessibilityState={{ selected: isSelected }}
                    rippleBorderless
                    onPress={() => pick(iso)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayDot,
                        isSelected && { backgroundColor: colors.tint },
                        !isSelected && isToday && { borderColor: colors.tint, borderWidth: 1 },
                      ]}
                    >
                      <Text
                        style={[
                          type.numeric,
                          {
                            color: isSelected ? colors.onPrimary : inMonth ? colors.text : colors.muted,
                            opacity: inMonth || isSelected ? 1 : 0.5,
                          },
                        ]}
                      >
                        {new Intl.DateTimeFormat(locale, { day: "numeric" }).format(day)}
                      </Text>
                    </View>
                  </MotionPressable>
                );
              })}
            </View>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = Array.from({ length: 12 }, (_, index) => index * 5);

export function TimeField({
  label,
  value,
  onChange,
  required = false,
  clearable = false,
  fallback = "19:00",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  clearable?: boolean;
  fallback?: string;
}) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  const { locale } = useDisplayPreferences();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value || fallback);
  useEffect(() => {
    if (visible) setDraft(value || fallback);
  }, [fallback, value, visible]);
  const [hour, minute] = draft.split(":").map(Number);
  const ar = language === "ar";
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const cell = (active: boolean) => [
    styles.timeCell,
    { backgroundColor: active ? colors.tint : colors.subtle },
  ];
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />
      <FieldTrigger
        label={label}
        display={valid ? formatTime(value, locale) : undefined}
        placeholder={ar ? "اختر وقتاً" : "Choose a time"}
        icon="schedule"
        onPress={() => setVisible(true)}
      />
      <BottomSheet
        visible={visible}
        title={label}
        onClose={() => setVisible(false)}
        footer={
          <>
            {clearable ? (
              <SheetButton
                label={ar ? "بدون" : "None"}
                onPress={() => {
                  onChange("");
                  setVisible(false);
                }}
              />
            ) : null}
            <SheetButton
              primary
              label={`${ar ? "تم" : "Done"} · ${formatTime(draft, locale)}`}
              onPress={() => {
                onChange(draft);
                setVisible(false);
              }}
            />
          </>
        }
      >
        <ScrollView bounces={false} contentContainerStyle={styles.timeBody}>
          <Text style={[type.label, { color: colors.muted }, directional(isRTL)]}>{ar ? "الساعة" : "Hour"}</Text>
          <View style={[styles.timeGrid, isRTL && styles.rowReverse]}>
            {hours.map((item) => (
              <MotionPressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: item === hour }}
                onPress={() => {
                  haptic.selection();
                  setDraft(`${pad(item)}:${pad(Number.isFinite(minute) ? minute : 0)}`);
                }}
                style={cell(item === hour)}
              >
                <Text style={[type.numeric, { color: item === hour ? colors.onPrimary : colors.text }]}>
                  {formatTime(`${pad(item)}:00`, locale).replace(/[:٫.]00/, "")}
                </Text>
              </MotionPressable>
            ))}
          </View>
          <Text style={[type.label, { color: colors.muted }, directional(isRTL)]}>{ar ? "الدقيقة" : "Minute"}</Text>
          <View style={[styles.timeGrid, isRTL && styles.rowReverse]}>
            {minutes.map((item) => (
              <MotionPressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: item === minute }}
                onPress={() => {
                  haptic.selection();
                  setDraft(`${pad(Number.isFinite(hour) ? hour : 19)}:${pad(item)}`);
                }}
                style={cell(item === minute)}
              >
                <Text style={[type.numeric, { color: item === minute ? colors.onPrimary : colors.text }]}>:{pad(item)}</Text>
              </MotionPressable>
            ))}
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

export function SwitchRow({
  label,
  detail,
  value,
  onValueChange,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptic.selection();
        onValueChange(!value);
      }}
      style={({ pressed }) => [
        styles.switchRow,
        isRTL && styles.rowReverse,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressedOpacity(pressed) },
      ]}
    >
      <View style={styles.flex}>
        <Text style={[type.body, { color: colors.text }, directional(isRTL)]}>{label}</Text>
        {detail ? <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{detail}</Text> : null}
      </View>
      <View style={[styles.track, { backgroundColor: value ? colors.tint : colors.border }, value !== isRTL && styles.trackOn]}>
        <View style={[styles.thumb, { backgroundColor: value ? colors.onPrimary : colors.surface }]} />
      </View>
    </MotionPressable>
  );
}

export function FormNotice({ message, tone = "error" }: { message: string; tone?: "error" | "info" }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const color = tone === "error" ? colors.error : colors.tint;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, isRTL && styles.rowReverse, { backgroundColor: colors.subtle, borderColor: color }]}
    >
      <MaterialIcons name={tone === "error" ? "error-outline" : "info-outline"} size={20} color={color} />
      <Text style={[type.meta, styles.flex, { color: colors.text }, directional(isRTL)]}>{message}</Text>
    </View>
  );
}

export function InlineLink({ label, icon = "add", onPress }: { label: string; icon?: MaterialIcon; onPress: () => void }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.inlineLink, isRTL && styles.rowReverse, isRTL && styles.selfEnd, { opacity: pressedOpacity(pressed) }]}
    >
      <MaterialIcons name={icon} size={18} color={colors.tint} />
      <Text style={[type.label, { color: colors.tint }]}>{label}</Text>
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  selfEnd: { alignSelf: "flex-end" },
  section: { gap: space.md },
  sectionBody: { gap: space.lg },
  field: { gap: 6 },
  label: { fontWeight: "500" },
  input: { borderRadius: radius.md, minHeight: touchTarget + 4, paddingHorizontal: 14, paddingVertical: 12 },
  textarea: { minHeight: 104, textAlignVertical: "top" },
  picker: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.sm,
    minHeight: touchTarget + 4,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    maxWidth: 200,
    minHeight: 36,
    overflow: "hidden",
    paddingLeft: 14,
    paddingRight: 8,
  },
  chipText: { flexShrink: 1 },
  shade: { backgroundColor: "rgba(8,10,9,0.42)", flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, maxHeight: "86%", overflow: "hidden", paddingTop: 10 },
  handle: { alignSelf: "center", borderRadius: radius.pill, height: 4, marginBottom: space.sm, width: 36 },
  sheetHeader: { alignItems: "center", flexDirection: "row", gap: space.md, paddingBottom: space.md, paddingHorizontal: space.gutter, paddingTop: space.xs },
  sheetFooter: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.gutter, paddingTop: space.md },
  sheetButton: { alignItems: "center", borderRadius: radius.md, flex: 1, justifyContent: "center", minHeight: touchTarget, overflow: "hidden", paddingHorizontal: space.lg },
  close: { alignItems: "center", borderRadius: radius.pill, height: 36, justifyContent: "center", overflow: "hidden", width: 36 },
  optionList: { paddingBottom: space.sm },
  option: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.md,
    marginHorizontal: space.md,
    minHeight: 52,
    overflow: "hidden",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  calendar: { paddingHorizontal: space.md },
  monthRow: { alignItems: "center", flexDirection: "row", marginBottom: space.sm },
  monthNav: { alignItems: "center", height: touchTarget, justifyContent: "center", width: touchTarget },
  monthLabel: { flex: 1, textAlign: "center" },
  week: { flexDirection: "row" },
  weekday: { flex: 1, paddingVertical: space.sm, textAlign: "center" },
  dayCell: { alignItems: "center", flex: 1, height: touchTarget, justifyContent: "center" },
  dayDot: { alignItems: "center", borderRadius: radius.pill, height: 40, justifyContent: "center", width: 40 },
  timeBody: { gap: space.md, paddingHorizontal: space.gutter },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  timeCell: { alignItems: "center", borderRadius: radius.md, justifyContent: "center", minHeight: 44, minWidth: 64, overflow: "hidden", paddingHorizontal: space.sm },
  switchRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.md,
    minHeight: 60,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: space.sm,
  },
  track: { borderRadius: radius.pill, height: 28, justifyContent: "center", paddingHorizontal: 3, width: 48 },
  trackOn: { alignItems: "flex-end" },
  thumb: { borderRadius: radius.pill, elevation: 1, height: 22, width: 22 },
  notice: { alignItems: "flex-start", borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: space.sm, padding: space.md },
  inlineLink: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 4, minHeight: 40 },
});
