import { Platform, Pressable, type PressableProps } from "react-native";
import { useColors } from "@/hooks/use-colors";

export const pressedOpacity = (pressed: boolean, amount = 0.6) => (pressed && Platform.OS !== "android" ? amount : 1);

type MotionPressableProps = PressableProps & { rippleBorderless?: boolean };

export function MotionPressable({ android_ripple, rippleBorderless = false, ...props }: MotionPressableProps) {
  const colors = useColors();
  return (
    <Pressable
      android_ripple={android_ripple ?? { color: colors.border, borderless: rippleBorderless, foreground: true }}
      {...props}
    />
  );
}
