import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MotionPressable, pressedOpacity } from "@/components/motion-pressable";
import { directional, hairline, radius, space, touchTarget, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime, getRef } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import type { Book, ClassStatus, DarsClass, Location, Teacher } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

export type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

const chevron = (isRTL: boolean): MaterialIcon => (isRTL ? "chevron-left" : "chevron-right");

export function IconButton({
  icon,
  label,
  onPress,
  tone = "quiet",
  fallbackToHomeWhenCannotGoBack = false,
}: {
  icon: MaterialIcon;
  label: string;
  onPress: () => void;
  tone?: "quiet" | "primary" | "plain";
  fallbackToHomeWhenCannotGoBack?: boolean;
}) {
  const colors = useColors();
  const background = tone === "primary" ? colors.tint : tone === "quiet" ? colors.subtle : "transparent";
  const foreground = tone === "primary" ? colors.onPrimary : colors.text;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      rippleBorderless={tone === "plain"}
      onPress={() => {
        haptic.light();
        if (fallbackToHomeWhenCannotGoBack && !router.canGoBack()) {
          router.replace("/(tabs)" as never);
          return;
        }
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: background, opacity: pressedOpacity(pressed) }]}
    >
      <MaterialIcons name={icon} size={22} color={foreground} />
    </MotionPressable>
  );
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <View style={[styles.header, isRTL && styles.rowReverse]}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[type.label, { color: colors.muted }, directional(isRTL)]}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={[type.display, { color: colors.text }, directional(isRTL)]}>
          {title}
        </Text>
      </View>
      {action ? <View style={[styles.headerActions, isRTL && styles.rowReverse]}>{action}</View> : null}
    </View>
  );
}

export function TopBar({ onBack, title, actions }: { onBack?: () => void; title?: string; actions?: ReactNode }) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  return (
    <View style={[styles.topBar, isRTL && styles.rowReverse]}>
      {onBack ? (
        <IconButton
          icon={isRTL ? "arrow-forward" : "arrow-back"}
          tone="plain"
          label={language === "ar" ? "رجوع" : "Back"}
          onPress={onBack}
          fallbackToHomeWhenCannotGoBack
        />
      ) : null}
      <Text numberOfLines={1} style={[type.headline, styles.topBarTitle, { color: colors.text }, directional(isRTL)]}>
        {title ?? ""}
      </Text>
      {actions ? <View style={[styles.headerActions, isRTL && styles.rowReverse]}>{actions}</View> : null}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: { label: string; onPress: () => void } }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <View style={[styles.sectionHeader, isRTL && styles.rowReverse]}>
      <Text style={[type.label, styles.flex, { color: colors.muted }, directional(isRTL)]}>{title}</Text>
      {action ? (
        <MotionPressable
          accessibilityRole="button"
          hitSlop={10}
          rippleBorderless
          onPress={action.onPress}
          style={({ pressed }) => ({ opacity: pressedOpacity(pressed) })}
        >
          <Text style={[type.label, { color: colors.tint }]}>{action.label}</Text>
        </MotionPressable>
      ) : null}
    </View>
  );
}

export function ListGroup({ children, inset = true }: { children: ReactNode; inset?: boolean }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.group,
        inset && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: hairline },
      ]}
    >
      {children}
    </View>
  );
}

export function ListItem({
  icon,
  title,
  detail,
  value,
  onPress,
  trailing,
  tone = "default",
  last = false,
}: {
  icon?: MaterialIcon;
  title: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  tone?: "default" | "danger" | "accent";
  last?: boolean;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const accent = tone === "danger" ? colors.error : tone === "accent" ? colors.tint : colors.text;
  const body = (
    <>
      {icon ? (
        <View style={[styles.listIcon, { backgroundColor: tone === "danger" ? colors.subtle : colors.wash }]}>
          <MaterialIcons name={icon} size={19} color={tone === "danger" ? colors.error : colors.tint} />
        </View>
      ) : null}
      <View style={styles.listCopy}>
        <Text numberOfLines={2} style={[type.body, { color: accent }, directional(isRTL)]}>
          {title}
        </Text>
        {detail ? (
          <Text numberOfLines={2} style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
            {detail}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text numberOfLines={1} style={[type.meta, styles.listValue, { color: colors.muted }]}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {onPress && !trailing ? <MaterialIcons name={chevron(isRTL)} size={20} color={colors.muted} /> : null}
    </>
  );
  const rowStyle = [
    styles.listItem,
    isRTL && styles.rowReverse,
    !last && { borderBottomColor: colors.border, borderBottomWidth: hairline },
  ];
  if (!onPress) return <View style={rowStyle}>{body}</View>;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [rowStyle, { opacity: pressedOpacity(pressed) }]}
    >
      {body}
    </MotionPressable>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  autoFocus = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  return (
    <View style={[styles.search, isRTL && styles.rowReverse, { backgroundColor: colors.subtle }]}>
      <MaterialIcons name="search" size={20} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        selectionColor={colors.tint}
        cursorColor={colors.tint}
        style={[type.body, styles.searchInput, { color: colors.text }, directional(isRTL)]}
        returnKeyType="search"
      />
      {value ? (
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={language === "ar" ? "مسح" : "Clear search"}
          hitSlop={10}
          rippleBorderless
          onPress={() => onChangeText("")}
        >
          <MaterialIcons name="cancel" size={18} color={colors.muted} />
        </MotionPressable>
      ) : null}
    </View>
  );
}

export function FilterChips({
  values,
  selected,
  onSelect,
  labels,
}: {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  labels?: Partial<Record<string, string>>;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.chips, isRTL && styles.rowReverse]}
    >
      {values.map((item) => {
        const active = selected === item;
        return (
          <MotionPressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              haptic.selection();
              onSelect(item);
            }}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: active ? colors.text : colors.subtle, opacity: pressedOpacity(pressed) },
            ]}
          >
            <Text style={[type.label, { color: active ? colors.background : colors.text }]}>{labels?.[item] ?? item}</Text>
          </MotionPressable>
        );
      })}
    </ScrollView>
  );
}

export function SegmentedControl<T extends string>({
  values,
  selected,
  onSelect,
  labels,
}: {
  values: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  labels: Record<T, string>;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.segment, isRTL && styles.rowReverse, { backgroundColor: colors.subtle }]}
    >
      {values.map((item) => {
        const active = item === selected;
        return (
          <MotionPressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            android_ripple={null}
            onPress={() => {
              haptic.selection();
              onSelect(item);
            }}
            style={[styles.segmentItem, active && [styles.segmentActive, { backgroundColor: colors.surface }]]}
          >
            <Text numberOfLines={1} style={[type.label, { color: active ? colors.text : colors.muted }]}>
              {labels[item]}
            </Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.wash }]}>
      <Text style={[type.caption, { color: colors.tint }]}>{label}</Text>
    </View>
  );
}

export function StatusPill({ status }: { status: ClassStatus }) {
  const colors = useColors();
  const { language } = useI18n();
  const ar = language === "ar";
  const label =
    status === "completed" ? (ar ? "مكتمل" : "Completed") : status === "cancelled" ? (ar ? "ملغي" : "Cancelled") : ar ? "قادم" : "Upcoming";
  const tint = status === "upcoming" ? colors.tint : status === "cancelled" ? colors.error : colors.muted;
  return (
    <View style={[styles.badge, styles.statusPill, { backgroundColor: status === "upcoming" ? colors.wash : colors.subtle }]}>
      <View style={[styles.statusDot, { backgroundColor: tint }]} />
      <Text style={[type.caption, { color: tint }]}>{label}</Text>
    </View>
  );
}

function TimeColumn({ item }: { item: DarsClass }) {
  const colors = useColors();
  const { locale } = useDisplayPreferences();
  return (
    <View style={styles.timeColumn}>
      <Text style={[type.numeric, { color: colors.text }]}>{formatTime(item.startTime, locale)}</Text>
      {item.endTime ? (
        <Text style={[type.meta, { color: colors.muted, fontVariant: ["tabular-nums"] }]}>{formatTime(item.endTime, locale)}</Text>
      ) : null}
    </View>
  );
}

export function ClassCard({
  item,
  teachers,
  books,
  locations,
  onPress,
  compact = false,
  showDate = false,
}: {
  item: DarsClass;
  teachers: Teacher[];
  books: Book[];
  locations: Location[];
  onPress?: () => void;
  compact?: boolean;
  showDate?: boolean;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const { dateDisplay, locale } = useDisplayPreferences();
  const teacher = getRef(teachers, item.teacherId);
  const book = getRef(books, item.bookId);
  const location = getRef(locations, item.locationId);
  const navigate = onPress ?? (() => router.push(`/class/${item.id}` as never));
  const meta = [teacher?.name, location?.name ?? item.city].filter(Boolean).join(" · ");
  const dateLabel = showDate ? formatClassDate(item.date, dateDisplay, locale) : "";
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={[item.title, dateLabel, meta].filter(Boolean).join(", ")}
      onPress={() => {
        haptic.light();
        navigate();
      }}
      style={({ pressed }) => [
        styles.classCard,
        isRTL && styles.rowReverse,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressedOpacity(pressed) },
      ]}
    >
      <TimeColumn item={item} />
      <View style={[styles.rail, { backgroundColor: item.status === "upcoming" ? colors.tint : colors.border }]} />
      <View style={styles.classCopy}>
        <Text numberOfLines={2} style={[type.bodyStrong, { color: colors.text }, directional(isRTL)]}>
          {item.title}
        </Text>
        {dateLabel ? (
          <Text numberOfLines={1} style={[type.meta, { color: colors.tint }, directional(isRTL)]}>
            {dateLabel}
          </Text>
        ) : null}
        {meta ? (
          <Text numberOfLines={1} style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
            {meta}
          </Text>
        ) : null}
        <View style={[styles.cardFoot, isRTL && styles.rowReverse]}>
          <SubjectBadge label={item.subject} />
          {!compact && book ? (
            <Text numberOfLines={1} style={[type.meta, styles.flex, { color: colors.muted }, directional(isRTL)]}>
              {book.name}
            </Text>
          ) : null}
          {item.status !== "upcoming" ? <StatusPill status={item.status} /> : null}
        </View>
      </View>
    </MotionPressable>
  );
}

export function AgendaRow({
  item,
  teachers,
  books: _books,
  locations,
  onPress,
  last = false,
}: {
  item: DarsClass;
  teachers: Teacher[];
  books: Book[];
  locations: Location[];
  onPress?: () => void;
  last?: boolean;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const teacher = getRef(teachers, item.teacherId);
  const location = getRef(locations, item.locationId);
  const navigate = onPress ?? (() => router.push(`/class/${item.id}` as never));
  const meta = [teacher?.name, location?.name ?? item.city].filter(Boolean).join(" · ");
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${meta}`}
      onPress={() => {
        haptic.light();
        navigate();
      }}
      style={({ pressed }) => [
        styles.agendaRow,
        isRTL && styles.rowReverse,
        !last && { borderBottomColor: colors.border, borderBottomWidth: hairline },
        { opacity: pressedOpacity(pressed) },
      ]}
    >
      <TimeColumn item={item} />
      <View style={[styles.rail, { backgroundColor: colors.tint }]} />
      <View style={styles.classCopy}>
        <Text numberOfLines={1} style={[type.bodyStrong, { color: colors.text }, directional(isRTL)]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
          {[item.subject, meta].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </MotionPressable>
  );
}

export function Avatar({ label, icon }: { label: string; icon?: MaterialIcon }) {
  const colors = useColors();
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: colors.wash }]}>
      {icon ? (
        <MaterialIcons name={icon} size={20} color={colors.tint} />
      ) : (
        <Text style={[type.label, { color: colors.tint }]}>{initials || "•"}</Text>
      )}
    </View>
  );
}

export function DirectoryRow({
  icon,
  title,
  subtitle,
  onPress,
  tag,
  initials = false,
  last = false,
}: {
  icon: MaterialIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  tag?: string;
  initials?: boolean;
  last?: boolean;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.directoryRow,
        isRTL && styles.rowReverse,
        !last && { borderBottomColor: colors.border, borderBottomWidth: hairline },
        { opacity: pressedOpacity(pressed) },
      ]}
    >
      <Avatar label={title} icon={initials ? undefined : icon} />
      <View style={styles.listCopy}>
        <Text numberOfLines={1} style={[type.bodyStrong, { color: colors.text }, directional(isRTL)]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
          {subtitle}
        </Text>
      </View>
      {tag ? (
        <View style={[styles.count, { backgroundColor: colors.subtle }]}>
          <Text style={[type.caption, { color: colors.muted }]}>{tag}</Text>
        </View>
      ) : null}
      <MaterialIcons name={chevron(isRTL)} size={20} color={colors.muted} />
    </MotionPressable>
  );
}

export function EmptyState({
  icon = "event-busy",
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: MaterialIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const writing = { writingDirection: isRTL ? ("rtl" as const) : ("ltr" as const) };
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.subtle }]}>
        <MaterialIcons name={icon} size={26} color={colors.muted} />
      </View>
      <Text style={[type.headline, styles.center, { color: colors.text }, writing]}>{title}</Text>
      <Text style={[type.meta, styles.center, styles.emptyText, { color: colors.muted }, writing]}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.emptyAction}>
          <PrimaryButton label={actionLabel} onPress={onAction} variant="tonal" size="compact" />
        </View>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  variant = "primary",
  size = "regular",
}: {
  label: string;
  onPress: () => void;
  icon?: MaterialIcon;
  disabled?: boolean;
  variant?: "primary" | "tonal" | "outline" | "danger";
  size?: "regular" | "compact";
}) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const palette = {
    primary: { background: colors.tint, foreground: colors.onPrimary, border: colors.tint },
    tonal: { background: colors.wash, foreground: colors.tint, border: colors.wash },
    outline: { background: "transparent", foreground: colors.text, border: colors.border },
    danger: { background: "transparent", foreground: colors.error, border: colors.border },
  }[variant];
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      android_ripple={{ color: variant === "primary" ? "rgba(255,255,255,0.18)" : colors.border, foreground: true }}
      onPress={() => {
        haptic.medium();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        size === "compact" && styles.buttonCompact,
        isRTL && styles.rowReverse,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressedOpacity(pressed, 0.8),
        },
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={palette.foreground} /> : null}
      <Text style={[type.bodyStrong, { color: palette.foreground, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text>
    </MotionPressable>
  );
}

export function Fab({ label, icon = "add", onPress }: { label: string; icon?: MaterialIcon; onPress: () => void }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: "rgba(255,255,255,0.2)", foreground: true }}
      onPress={() => {
        haptic.medium();
        onPress();
      }}
      style={({ pressed }) => [
        styles.fab,
        isRTL ? styles.fabStart : styles.fabEnd,
        { backgroundColor: colors.tint, opacity: pressedOpacity(pressed, 0.85) },
      ]}
    >
      <MaterialIcons name={icon} size={22} color={colors.onPrimary} />
      <Text style={[type.bodyStrong, { color: colors.onPrimary }]}>{label}</Text>
    </MotionPressable>
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  rowReverse: { flexDirection: "row-reverse" },
  header: { alignItems: "flex-end", flexDirection: "row", gap: space.md, justifyContent: "space-between", marginBottom: space.lg, minHeight: 48 },
  headerCopy: { flex: 1, gap: 2, minWidth: 0 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  topBar: { alignItems: "center", flexDirection: "row", gap: space.xs, minHeight: 56 },
  topBarTitle: { flex: 1, marginHorizontal: space.xs },
  sectionHeader: { alignItems: "center", flexDirection: "row", marginBottom: space.sm, marginTop: space.xl, minHeight: 24 },
  group: { borderRadius: radius.lg, overflow: "hidden" },
  listItem: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.md },
  listIcon: { alignItems: "center", borderRadius: radius.md, height: 36, justifyContent: "center", width: 36 },
  listCopy: { flex: 1, gap: 2, minWidth: 0 },
  listValue: { maxWidth: "45%" },
  iconButton: { alignItems: "center", borderRadius: radius.pill, height: touchTarget - 4, justifyContent: "center", overflow: "hidden", width: touchTarget - 4 },
  search: { alignItems: "center", borderRadius: radius.md, flexDirection: "row", gap: space.sm, minHeight: touchTarget, paddingHorizontal: space.md },
  searchInput: { flex: 1, minHeight: touchTarget, paddingVertical: 0 },
  chips: { flexDirection: "row", gap: space.sm, paddingVertical: 2 },
  chip: { alignItems: "center", borderRadius: radius.pill, justifyContent: "center", minHeight: 36, overflow: "hidden", paddingHorizontal: 14 },
  segment: { borderRadius: radius.md, flexDirection: "row", gap: 2, padding: 3 },
  segmentItem: { alignItems: "center", borderRadius: radius.sm + 1, flex: 1, justifyContent: "center", minHeight: 38, paddingHorizontal: space.sm },
  segmentActive: { elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
  badge: { alignSelf: "flex-start", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  statusPill: { alignItems: "center", flexDirection: "row", gap: 5 },
  statusDot: { borderRadius: 3, height: 6, width: 6 },
  timeColumn: { alignItems: "flex-start", minWidth: 62 },
  rail: { alignSelf: "stretch", borderRadius: 2, width: 3 },
  classCard: { borderRadius: radius.lg, borderWidth: hairline, flexDirection: "row", gap: space.md, overflow: "hidden", padding: space.lg },
  classCopy: { flex: 1, gap: 3, minWidth: 0 },
  cardFoot: { alignItems: "center", flexDirection: "row", gap: space.sm, marginTop: space.xs },
  agendaRow: { alignItems: "stretch", flexDirection: "row", gap: space.md, minHeight: 64, paddingHorizontal: space.lg, paddingVertical: 14 },
  avatar: { alignItems: "center", borderRadius: radius.pill, height: 40, justifyContent: "center", width: 40 },
  directoryRow: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 68, paddingHorizontal: space.lg, paddingVertical: space.md },
  count: { alignItems: "center", borderRadius: radius.pill, justifyContent: "center", minWidth: 24, paddingHorizontal: 7, paddingVertical: 2 },
  empty: { alignItems: "center", gap: space.sm, justifyContent: "center", paddingHorizontal: space.xxl, paddingVertical: 48 },
  emptyIcon: { alignItems: "center", borderRadius: radius.pill, height: 56, justifyContent: "center", marginBottom: space.xs, width: 56 },
  emptyText: { maxWidth: 300 },
  emptyAction: { marginTop: space.sm },
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    minHeight: 52,
    overflow: "hidden",
    paddingHorizontal: space.xl,
  },
  buttonCompact: { alignSelf: "center", minHeight: 44, paddingHorizontal: space.lg },
  fab: {
    alignItems: "center",
    borderRadius: radius.lg,
    bottom: space.lg,
    elevation: 3,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 56,
    overflow: "hidden",
    paddingHorizontal: space.xl,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  fabEnd: { right: space.gutter },
  fabStart: { left: space.gutter },
});
