import { View, type ViewProps, useWindowDimensions } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { PaperDots } from "@/components/doodle";
import { getContentMaxWidth } from "@/lib/responsive-layout";
import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
}

export function ScreenContainer({ children, edges = ["top", "bottom", "left", "right"], className, containerClassName, safeAreaClassName, style, ...props }: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const maxWidth = getContentMaxWidth(width);
  return <View className={cn("flex-1", "bg-background", containerClassName)} {...props}>
    <PaperDots />
    <SafeAreaView edges={edges} className={cn("flex-1", safeAreaClassName)}>
      <View className={cn("flex-1", className)} style={[{ alignSelf: "center", maxWidth, width: "100%" }, style]}>{children}</View>
    </SafeAreaView>
  </View>;
}
