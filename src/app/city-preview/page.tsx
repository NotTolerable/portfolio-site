import type { Metadata } from "next";
import { CityPreview } from "@/components/city-preview";
export const metadata: Metadata = {
  title: "After Hours — City Preview",
  description:
    "An experimental winter night walk through a historic city street.",
  robots: { index: false, follow: false },
};
export default function CityPreviewPage() {
  return <CityPreview />;
}
