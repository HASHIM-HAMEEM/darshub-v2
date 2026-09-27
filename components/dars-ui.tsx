import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { type ReactNode, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";
import { BooksDoodle, Icon, LanternDoodle, SketchSurface, Squiggle, subjectInk } from "@/components/doodle";
import { MotionPressable } from "@/components/motion-pressable";
import { directional, fonts, handStyle, space, touchTarget, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime, getRef } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import type { Book, ClassStatus, DarsClass, Location, Teacher } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

export type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

const chevron = (isRTL: boolean): MaterialIcon => (isRTL ? "chevron-left" : "chevron-right");

const seedOf = (value: string) => {
  let hash = 7;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return hash;
};

const enter = FadeInDown.springify().damping(18).stiffness(160);

export function DashedRule({ inset = 0 }: { inset?: number }) {
  const colors = useColors();
  return (
    <Svg height={2} width="100%" style={{ marginHorizontal: inset }} pointerEvents="none">
      <Line x1="0" y1="1" x2="100%" y2="1" stroke={colors.border} strokeWidth={1.6} strokeDasharray="5 5" strokeLinecap="round" />
    </Svg>
  );
}

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
  const fill = tone === "primary" ? colors.tint : colors.surface;
  const foreground = tone === "primary" ? colors.onPrimary : colors.text;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      squish={0.88}
      tilt={-6}
      onPress={() => {
        haptic.light();
        if (fallbackToHomeWhenCannotGoBack && !router.canGoBack()) {
          router.replace("/(tabs)" as never);
          return;
        }
        onPress();
      }}
    >
      {tone === "plain" ? (
        <View style={styles.iconButton}>
          <Icon name={icon} size={24} color={foreground} />
        </View>
      ) : (
        <SketchSurface corner={22} seed={seedOf(label)} fill={fill} style={styles.iconButton}>
          <Icon name={icon} size={22} color={foreground} />
        </SketchSurface>
      )}
    </MotionPressable>
  );
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const underline = Math.min(200, Math.max(70, title.length * 13));
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={[styles.header, isRTL && styles.rowReverse]}>
      <View style={[styles.headerCopy, isRTL && styles.alignEnd]}>
        {eyebrow ? <Text style={[type.caption, styles.eyebrow, { color: colors.muted }, directional(isRTL)]}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={[handStyle(title, type.display), { color: colors.text }, directional(isRTL)]}>
          {title}
        </Text>
        <Squiggle width={underline} />
      </View>
      {action ? <View style={[styles.headerActions, isRTL && styles.rowReverse]}>{action}</View> : null}
    </Animated.View>
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
          label={language === "ar" ? "رجوع" : "Back"}
          onPress={onBack}
          fallbackToHomeWhenCannotGoBack
        />
      ) : null}
      <Text numberOfLines={1} style={[handStyle(title, type.title), styles.topBarTitle, { color: colors.text }, directional(isRTL)]}>
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
      <Text style={[handStyle(title, styles.sectionTitle), styles.flex, { color: colors.text }, directional(isRTL)]}>{title}</Text>
      {action ? (
        <MotionPressable accessibilityRole="button" hitSlop={10} onPress={action.onPress}>
          <Text style={[type.label, styles.link, { color: colors.tint, textDecorationColor: colors.tint }]}>{action.label}</Text>
        </MotionPressable>
      ) : null}
    </View>
  );
}

export function ListGroup({ children, inset = true }: { children: ReactNode; inset?: boolean }) {
  if (!inset) return <View>{children}</View>;
  return (
    <Animated.View entering={enter}>
      <SketchSurface corner={20} seed={3} style={styles.group}>
        {children}
      </SketchSurface>
    </Animated.View>
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
    <View style={[styles.listItem, isRTL && styles.rowReverse]}>
      {icon ? (
        <View style={[styles.listIcon, { backgroundColor: tone === "danger" ? colors.subtle : subjectInk(title, colors) }]}>
          <Icon name={icon} size={20} color={tone === "danger" ? colors.error : colors.line} />
        </View>
      ) : null}
      <View style={styles.listCopy}>
        <Text numberOfLines={2} style={[type.bodyStrong, { color: accent }, directional(isRTL)]}>
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
      {onPress && !trailing ? <Icon name={chevron(isRTL)} size={18} color={colors.muted} /> : null}
    </View>
  );
  const content = (
    <>
      {body}
      {!last ? <DashedRule /> : null}
    </>
  );
  if (!onPress) return <View>{content}</View>;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      squish={0.98}
      tilt={0}
      onPress={() => {
        haptic.light();
        onPress();
      }}
    >
      {content}
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
  const [focused, setFocused] = useState(false);
  return (
    <SketchSurface corner={18} seed={21} shadow={focused} stroke={focused ? colors.tint : colors.line} style={[styles.search, isRTL && styles.rowReverse]}>
      <Icon name="search" size={21} color={focused ? colors.tint : colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        selectionColor={colors.tint}
        cursorColor={colors.tint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[type.body, styles.searchInput, { color: colors.text }, directional(isRTL)]}
        returnKeyType="search"
      />
      {value ? (
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={language === "ar" ? "مسح" : "Clear search"}
          hitSlop={10}
          onPress={() => onChangeText("")}
        >
          <Icon name="close" size={18} color={colors.muted} />
        </MotionPressable>
      ) : null}
    </SketchSurface>
  );
}

function Chip({ label, active, onPress, seed }: { label: string; active: boolean; onPress: () => void; seed: number }) {
  const colors = useColors();
  return (
    <MotionPressable accessibilityRole="button" accessibilityState={{ selected: active }} squish={0.9} tilt={-3} onPress={onPress}>
      <SketchSurface corner={16} seed={seed} shadow={active} fill={active ? colors.highlight : colors.surface} stroke={active ? colors.line : colors.border} style={styles.chip}>
        <Text style={[type.label, { color: active ? colors.line : colors.text }]}>{label}</Text>
      </SketchSurface>
    </MotionPressable>
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
  const { isRTL } = useI18n();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, isRTL && styles.rowReverse]}>
      {values.map((item, index) => (
        <Chip
          key={item}
          label={labels?.[item] ?? item}
          active={selected === item}
          seed={index + 30}
          onPress={() => {
            haptic.selection();
            onSelect(item);
          }}
        />
      ))}
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
    <SketchSurface corner={18} seed={41} shadow={false} fill={colors.subtle} stroke={colors.border} style={[styles.segment, isRTL && styles.rowReverse]}>
      <View accessibilityRole="tablist" style={[styles.segmentRow, isRTL && styles.rowReverse]}>
        {values.map((item, index) => {
          const active = item === selected;
          return (
            <MotionPressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              squish={0.94}
              tilt={0}
              onPress={() => {
                haptic.selection();
                onSelect(item);
              }}
              style={styles.flex}
            >
              {active ? (
                <SketchSurface corner={14} seed={index + 50} fill={colors.highlight} style={styles.segmentItem}>
                  <Text numberOfLines={1} style={[type.label, { color: colors.line }]}>{labels[item]}</Text>
                </SketchSurface>
              ) : (
                <View style={styles.segmentItem}>
                  <Text numberOfLines={1} style={[type.label, { color: colors.muted }]}>{labels[item]}</Text>
                </View>
              )}
            </MotionPressable>
          );
        })}
      </View>
    </SketchSurface>
  );
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: subjectInk(label, colors) }]}>
      <Text style={[type.caption, { color: colors.line }]}>{label}</Text>
    </View>
  );
}

export function StatusPill({ status }: { status: ClassStatus }) {
  const colors = useColors();
  const { language } = useI18n();
  const ar = language === "ar";
  const label =
    status === "completed" ? (ar ? "مكتمل" : "Done") : status === "cancelled" ? (ar ? "ملغي" : "Cancelled") : ar ? "قادم" : "Upcoming";
  const tint = status === "upcoming" ? colors.tint : status === "cancelled" ? colors.error : colors.muted;
  return (
    <View style={[styles.stamp, { borderColor: tint }]}>
      <Text style={[type.caption, { color: tint }]}>{ar ? label : label.toUpperCase()}</Text>
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

function Bullet({ item }: { item: DarsClass }) {
  const colors = useColors();
  if (item.status === "completed") return <Icon name="check" size={18} color={colors.tint} strokeWidth={2.6} />;
  if (item.status === "cancelled") return <Icon name="close" size={16} color={colors.error} strokeWidth={2.4} />;
  return <View style={[styles.bullet, { backgroundColor: subjectInk(item.subject, colors), borderColor: colors.line }]} />;
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
  const faded = item.status === "cancelled";
  return (
    <Animated.View entering={enter}>
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={[item.title, dateLabel, meta].filter(Boolean).join(", ")}
        onPress={() => {
          haptic.light();
          navigate();
        }}
      >
        <SketchSurface corner={20} seed={seedOf(item.id)} style={[styles.classCard, isRTL && styles.rowReverse, faded && styles.faded]}>
          <TimeColumn item={item} />
          <View style={[styles.rail, { backgroundColor: subjectInk(item.subject, colors), borderColor: colors.line }]} />
          <View style={styles.classCopy}>
            <Text numberOfLines={2} style={[type.headline, { color: colors.text }, faded && styles.strike, directional(isRTL)]}>
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
        </SketchSurface>
      </MotionPressable>
    </Animated.View>
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
      squish={0.98}
      tilt={0}
      onPress={() => {
        haptic.light();
        navigate();
      }}
    >
      <View style={[styles.agendaRow, isRTL && styles.rowReverse]}>
        <TimeColumn item={item} />
        <View style={styles.bulletSlot}>
          <Bullet item={item} />
        </View>
        <View style={styles.classCopy}>
          <Text numberOfLines={1} style={[type.bodyStrong, { color: colors.text }, item.status === "cancelled" && styles.strike, directional(isRTL)]}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
            {[item.subject, meta].filter(Boolean).join(" · ")}
          </Text>
        </View>
        <Icon name={chevron(isRTL)} size={18} color={colors.muted} />
      </View>
      {!last ? <DashedRule /> : null}
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
    <SketchSurface corner={21} seed={seedOf(label)} shadow={false} fill={subjectInk(label, colors)} style={styles.avatar}>
      {icon ? (
        <Icon name={icon} size={21} color={colors.line} />
      ) : (
        <Text style={[handStyle(initials, styles.initials), { color: colors.line }]}>{initials || "•"}</Text>
      )}
    </SketchSurface>
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
      squish={0.98}
      tilt={0}
      onPress={() => {
        haptic.light();
        onPress();
      }}
    >
      <View style={[styles.directoryRow, isRTL && styles.rowReverse]}>
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
          <View style={[styles.count, { borderColor: colors.line }]}>
            <Text style={[type.caption, { color: colors.text }]}>{tag}</Text>
          </View>
        ) : null}
        <Icon name={chevron(isRTL)} size={18} color={colors.muted} />
      </View>
      {!last ? <DashedRule /> : null}
    </MotionPressable>
  );
}

const bookish: MaterialIcon[] = ["auto-stories", "menu-book", "library-add", "bookmark", "bookmark-border", "search-off"];

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
    <Animated.View entering={FadeInDown.duration(500)} style={styles.empty}>
      {bookish.includes(icon) ? <BooksDoodle size={112} /> : <LanternDoodle size={112} />}
      <Text style={[handStyle(title, type.title), styles.center, { color: colors.text }, writing]}>{title}</Text>
      <Text style={[type.meta, styles.center, styles.emptyText, { color: colors.muted }, writing]}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.emptyAction}>
          <PrimaryButton label={actionLabel} onPress={onAction} variant="tonal" size="compact" />
        </View>
      ) : null}
    </Animated.View>
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
    primary: { fill: colors.tint, foreground: colors.onPrimary, stroke: colors.line },
    tonal: { fill: colors.highlight, foreground: colors.line, stroke: colors.line },
    outline: { fill: colors.surface, foreground: colors.text, stroke: colors.line },
    danger: { fill: colors.surface, foreground: colors.error, stroke: colors.error },
  }[variant];
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      squish={0.95}
      tilt={-1.2}
      style={size === "compact" ? styles.selfCenter : styles.selfStretch}
      onPress={() => {
        haptic.medium();
        onPress();
      }}
    >
      <SketchSurface
        corner={18}
        seed={seedOf(label)}
        fill={palette.fill}
        stroke={palette.stroke}
        shadowColor={variant === "danger" ? colors.error : colors.line}
        style={[styles.button, size === "compact" && styles.buttonCompact, isRTL && styles.rowReverse, disabled && styles.disabled]}
      >
        {icon ? <Icon name={icon} size={20} color={palette.foreground} strokeWidth={2.2} /> : null}
        <Text style={[type.headline, { color: palette.foreground, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text>
      </SketchSurface>
    </MotionPressable>
  );
}

export function Fab({ label, icon = "add", onPress }: { label: string; icon?: MaterialIcon; onPress: () => void }) {
  const colors = useColors();
  const { isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(12).delay(250)}
      style={[styles.fab, isRTL ? styles.fabStart : styles.fabEnd, { bottom: getTabListBottomPadding(insets.bottom) + space.sm }]}
    >
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        squish={0.9}
        tilt={-4}
        onPress={() => {
          haptic.medium();
          onPress();
        }}
      >
        <SketchSurface corner={24} seed={77} fill={colors.highlight} style={[styles.fabBody, isRTL && styles.rowReverse]}>
          <Icon name={icon} size={24} color={colors.line} strokeWidth={2.6} />
          <Text style={[handStyle(label, styles.fabLabel), { color: colors.line }]}>{label}</Text>
        </SketchSurface>
      </MotionPressable>
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  rowReverse: { flexDirection: "row-reverse" },
  alignEnd: { alignItems: "flex-end" },
  selfCenter: { alignSelf: "center" },
  selfStretch: { alignSelf: "stretch" },
  header: { alignItems: "flex-start", flexDirection: "row", gap: space.md, justifyContent: "space-between", marginBottom: space.lg, minHeight: 48 },
  headerCopy: { flex: 1, gap: 0, minWidth: 0 },
  eyebrow: { marginBottom: 2, textTransform: "uppercase" },
  headerActions: { alignItems: "center", flexDirection: "row", gap: space.sm, paddingTop: 6 },
  topBar: { alignItems: "center", flexDirection: "row", gap: space.sm, minHeight: 60 },
  topBarTitle: { flex: 1, marginHorizontal: space.xs },
  sectionHeader: { alignItems: "center", flexDirection: "row", marginBottom: space.sm, marginTop: space.xl, minHeight: 28 },
  sectionTitle: { fontFamily: fonts.hand, fontSize: 25, lineHeight: 30 },
  link: { textDecorationLine: "underline", textDecorationStyle: "dashed" },
  group: { paddingHorizontal: 2, paddingVertical: 2 },
  listItem: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 58, paddingHorizontal: space.lg, paddingVertical: space.md },
  listIcon: { alignItems: "center", borderRadius: 12, height: 36, justifyContent: "center", transform: [{ rotate: "-4deg" }], width: 36 },
  listCopy: { flex: 1, gap: 2, minWidth: 0 },
  listValue: { maxWidth: "45%" },
  iconButton: { alignItems: "center", height: touchTarget - 2, justifyContent: "center", width: touchTarget - 2 },
  search: { alignItems: "center", flexDirection: "row", gap: space.sm, minHeight: touchTarget + 4, paddingHorizontal: space.lg },
  searchInput: { flex: 1, minHeight: touchTarget, paddingVertical: 0 },
  chips: { flexDirection: "row", gap: space.sm, paddingBottom: 4, paddingTop: 2 },
  chip: { alignItems: "center", justifyContent: "center", minHeight: 38, paddingHorizontal: 16 },
  segment: { padding: 4 },
  segmentRow: { flexDirection: "row", gap: 4 },
  segmentItem: { alignItems: "center", justifyContent: "center", minHeight: 40, paddingHorizontal: space.sm },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, transform: [{ rotate: "-1.5deg" }] },
  stamp: { borderRadius: 6, borderWidth: 1.5, paddingHorizontal: 6, paddingVertical: 1, transform: [{ rotate: "-4deg" }] },
  timeColumn: { alignItems: "flex-start", minWidth: 60 },
  rail: { alignSelf: "stretch", borderRadius: 4, borderWidth: 1.2, width: 7 },
  classCard: { flexDirection: "row", gap: space.md, padding: space.lg },
  faded: { opacity: 0.6 },
  strike: { textDecorationLine: "line-through" },
  classCopy: { flex: 1, gap: 3, minWidth: 0 },
  cardFoot: { alignItems: "center", flexDirection: "row", gap: space.sm, marginTop: space.xs },
  agendaRow: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 64, paddingHorizontal: space.lg, paddingVertical: 12 },
  bulletSlot: { alignItems: "center", justifyContent: "center", width: 18 },
  bullet: { borderRadius: 7, borderWidth: 1.5, height: 13, transform: [{ rotate: "12deg" }], width: 13 },
  avatar: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  initials: { fontFamily: fonts.hand, fontSize: 21, lineHeight: 24 },
  directoryRow: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 70, paddingHorizontal: space.lg, paddingVertical: space.md },
  count: { alignItems: "center", borderRadius: 12, borderWidth: 1.4, justifyContent: "center", minWidth: 26, paddingHorizontal: 7, paddingVertical: 2, transform: [{ rotate: "3deg" }] },
  empty: { alignItems: "center", gap: space.sm, justifyContent: "center", paddingHorizontal: space.xxl, paddingVertical: 36 },
  emptyText: { maxWidth: 300 },
  emptyAction: { marginTop: space.sm },
  button: { alignItems: "center", flexDirection: "row", gap: space.sm, justifyContent: "center", minHeight: 54, paddingHorizontal: space.xl },
  buttonCompact: { minHeight: 46, paddingHorizontal: space.lg },
  disabled: { opacity: 0.45 },
  fab: { position: "absolute", transform: [{ rotate: "-2deg" }] },
  fabBody: { alignItems: "center", flexDirection: "row", gap: space.sm, minHeight: 58, paddingHorizontal: space.xl },
  fabLabel: { fontFamily: fonts.hand, fontSize: 24, lineHeight: 28 },
  fabEnd: { right: space.gutter },
  fabStart: { left: space.gutter },
});
