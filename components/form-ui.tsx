import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { HighlightBlob, Icon, ScribbleCircle, SketchSurface, Squiggle } from "@/components/doodle";
import { MotionPressable } from "@/components/motion-pressable";
import { directional, fonts, handStyle, radius, space, touchTarget, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { localizeMessage } from "@/lib/validation-copy";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <View style={styles.section}>
      <Text style={[handStyle(title, styles.sectionTitle), { color: colors.text }, directional(isRTL)]}>{title}</Text>
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
      <SketchSurface corner={16} seed={label.length + 5} shadow={focused} stroke={focused ? colors.tint : colors.line} strokeWidth={focused ? 2.2 : 1.6}>
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
          { color: colors.text },
          directional(isRTL),
        ]}
        returnKeyType={multiline ? "default" : "done"}
      />
      </SketchSurface>
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
      squish={0.97}
      tilt={-0.5}
    >
      <SketchSurface corner={16} seed={label.length + 9} strokeWidth={1.6} shadow={false} style={[styles.picker, isRTL && styles.rowReverse]}>
        <Text numberOfLines={1} style={[type.body, styles.flex, { color: display ? colors.text : colors.muted }, directional(isRTL)]}>
          {display ?? placeholder}
        </Text>
        <Icon name={icon} size={21} color={colors.text} />
      </SketchSurface>
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
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.line, paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <View style={styles.handle}>
            <Squiggle width={52} height={8} delay={60} strokeWidth={3} color={colors.muted} />
          </View>
          <View style={[styles.sheetHeader, isRTL && styles.rowReverse]}>
            <Text style={[handStyle(title, type.title), styles.flex, { color: colors.text }, directional(isRTL)]}>{title}</Text>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              hitSlop={8}
              squish={0.85}
              tilt={-8}
            >
              <SketchSurface corner={18} seed={13} shadow={false} style={styles.close}>
                <Icon name="close" size={18} color={colors.text} strokeWidth={2.2} />
              </SketchSurface>
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
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      style={styles.flex}
    >
      <SketchSurface corner={16} seed={label.length + 2} fill={primary ? colors.tint : colors.surface} style={styles.sheetButton}>
        <Text style={[type.headline, { color: primary ? colors.onPrimary : colors.text }]}>{label}</Text>
      </SketchSurface>
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
            squish={0.98}
            tilt={0}
            style={[styles.option, isRTL && styles.rowReverse]}
          >
            {active ? (
              <View style={styles.optionMark}>
                <HighlightBlob width={220} height={40} />
              </View>
            ) : null}
            {option.icon ? <Icon name={option.icon} size={20} color={active ? colors.tint : colors.muted} /> : null}
            <View style={styles.flex}>
              <Text style={[active ? type.bodyStrong : type.body, { color: colors.text }, directional(isRTL)]}>
                {option.label}
              </Text>
              {option.detail ? (
                <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{option.detail}</Text>
              ) : null}
            </View>
            {active ? <Icon name="check" size={22} color={colors.tint} strokeWidth={2.8} /> : null}
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
          squish={0.9}
          tilt={-3}
        >
          <SketchSurface corner={16} seed={sheetTitle.length + 31} shadow={active} fill={active ? colors.highlight : colors.surface} stroke={active ? colors.line : colors.border} style={[styles.chip, isRTL && styles.rowReverse]}>
            <Text numberOfLines={1} style={[type.label, styles.chipText, { color: active ? colors.line : colors.text }]}>
              {active ? selected?.label : placeholder}
            </Text>
            <Icon name="expand-more" size={16} color={active ? colors.line : colors.muted} strokeWidth={2.2} />
          </SketchSurface>
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
              <Icon name={isRTL ? "chevron-right" : "chevron-left"} size={24} color={colors.text} />
            </MotionPressable>
            <Text style={[styles.monthLabel, styles.monthHand, { color: colors.text }]}>
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}
            </Text>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={ar ? "الشهر التالي" : "Next month"}
              rippleBorderless
              onPress={() => shift(1)}
              style={styles.monthNav}
            >
              <Icon name={isRTL ? "chevron-left" : "chevron-right"} size={24} color={colors.text} />
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
                    <View style={[styles.dayDot, isSelected && { backgroundColor: colors.highlight }]}>
                      {isSelected || isToday ? <ScribbleCircle size={40} color={isSelected ? colors.line : colors.tint} seed={day.getDate()} /> : null}
                      <Text
                        style={[
                          type.numeric,
                          {
                            color: isSelected ? colors.line : inMonth ? colors.text : colors.muted,
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
    { backgroundColor: active ? colors.highlight : colors.surface, borderColor: active ? colors.line : colors.border },
    active && styles.timeActive,
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
                <Text style={[type.numeric, { color: item === hour ? colors.line : colors.text }]}>
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
                <Text style={[type.numeric, { color: item === minute ? colors.line : colors.text }]}>:{pad(item)}</Text>
              </MotionPressable>
            ))}
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function DoodleToggle({ value, isRTL }: { value: boolean; isRTL: boolean }) {
  const colors = useColors();
  const progress = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 12, stiffness: 260 });
  }, [progress, value]);
  const direction = isRTL ? -1 : 1;
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: direction * 22 * progress.value }, { rotate: `${progress.value * 180}deg` }] }));
  return (
    <SketchSurface corner={15} seed={value ? 3 : 4} shadow={false} fill={value ? colors.tint : colors.subtle} style={[styles.track, isRTL && styles.trackRtl]}>
      <Animated.View style={[styles.thumb, { backgroundColor: value ? colors.highlight : colors.surface, borderColor: colors.line }, thumb]}>
        {value ? <Icon name="check" size={13} color={colors.line} strokeWidth={3} /> : null}
      </Animated.View>
    </SketchSurface>
  );
}

export function DoodleSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      squish={0.9}
      tilt={0}
      onPress={() => {
        haptic.selection();
        onValueChange(!value);
      }}
    >
      <DoodleToggle value={value} isRTL={isRTL} />
    </MotionPressable>
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
      squish={0.98}
      tilt={0}
    >
      <SketchSurface corner={18} seed={label.length + 17} shadow={false} style={[styles.switchRow, isRTL && styles.rowReverse]}>
        <View style={styles.flex}>
          <Text style={[type.bodyStrong, { color: colors.text }, directional(isRTL)]}>{label}</Text>
          {detail ? <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{detail}</Text> : null}
        </View>
        <DoodleToggle value={value} isRTL={isRTL} />
      </SketchSurface>
    </MotionPressable>
  );
}

export function FormNotice({ message, tone = "error" }: { message: string; tone?: "error" | "info" }) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  const color = tone === "error" ? colors.error : colors.tint;
  return (
    <SketchSurface
      corner={14}
      seed={9}
      shadow={false}
      dashed
      stroke={color}
      fill={colors.surface}
      style={[styles.notice, isRTL && styles.rowReverse]}
    >
      <Icon name={tone === "error" ? "error-outline" : "info-outline"} size={20} color={color} />
      <Text style={[type.meta, styles.flex, { color: colors.text }, directional(isRTL)]}>{localizeMessage(message, language)}</Text>
    </SketchSurface>
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
      style={() => [styles.inlineLink, isRTL && styles.rowReverse, isRTL && styles.selfEnd]}
    >
      <Icon name={icon} size={18} color={colors.tint} />
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
  label: { fontFamily: fonts.bold },
  sectionTitle: { fontFamily: fonts.hand, fontSize: 26, lineHeight: 30 },
  input: { minHeight: touchTarget + 4, paddingHorizontal: 16, paddingVertical: 12 },
  textarea: { minHeight: 104, textAlignVertical: "top" },
  picker: { alignItems: "center", flexDirection: "row", gap: space.sm, minHeight: touchTarget + 4, paddingHorizontal: 16 },
  chip: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    maxWidth: 200,
    minHeight: 38,
    paddingLeft: 14,
    paddingRight: 8,
  },
  chipText: { flexShrink: 1 },
  shade: { backgroundColor: "rgba(8,10,9,0.42)", flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: radius.xl + 6, borderTopRightRadius: radius.xl + 6, borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2, maxHeight: "86%", overflow: "hidden", paddingTop: 10 },
  handle: { alignSelf: "center", marginBottom: space.sm },
  sheetHeader: { alignItems: "center", flexDirection: "row", gap: space.md, paddingBottom: space.md, paddingHorizontal: space.gutter, paddingTop: space.xs },
  sheetFooter: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.gutter, paddingTop: space.md },
  sheetButton: { alignItems: "center", justifyContent: "center", minHeight: touchTarget + 2, paddingHorizontal: space.lg },
  close: { alignItems: "center", height: 38, justifyContent: "center", width: 38 },
  optionList: { paddingBottom: space.sm },
  option: {
    alignItems: "center",
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
  monthHand: { fontFamily: fonts.hand, fontSize: 26, lineHeight: 30 },
  optionMark: { bottom: 0, justifyContent: "center", left: 4, position: "absolute", top: 0 },
  week: { flexDirection: "row" },
  weekday: { flex: 1, paddingVertical: space.sm, textAlign: "center" },
  dayCell: { alignItems: "center", flex: 1, height: touchTarget, justifyContent: "center" },
  dayDot: { alignItems: "center", borderRadius: radius.pill, height: 40, justifyContent: "center", width: 40 },
  timeBody: { gap: space.md, paddingHorizontal: space.gutter },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  timeCell: { alignItems: "center", borderRadius: 14, borderWidth: 1.5, justifyContent: "center", minHeight: 44, minWidth: 64, paddingHorizontal: space.sm },
  timeActive: { transform: [{ rotate: "-3deg" }, { scale: 1.06 }] },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.md,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: space.sm,
  },
  track: { alignItems: "flex-start", height: 30, justifyContent: "center", paddingHorizontal: 4, width: 54 },
  trackRtl: { alignItems: "flex-end" },
  thumb: { alignItems: "center", borderRadius: 12, borderWidth: 1.6, height: 22, justifyContent: "center", width: 22 },
  notice: { alignItems: "flex-start", flexDirection: "row", gap: space.sm, padding: space.md },
  inlineLink: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 4, minHeight: 40 },
});
