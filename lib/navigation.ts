import { router } from "expo-router";
import { resolveBackAction } from "@/lib/navigation-utils";

export { resolveBackAction } from "@/lib/navigation-utils";

export function goBackOrHome(): void {
  if (resolveBackAction(router.canGoBack()) === "back") {
    router.back();
    return;
  }
  router.replace("/" as never);
}
