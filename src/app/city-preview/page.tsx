import type { Metadata } from "next";
import { CityPreview } from "@/components/city-preview";
export const metadata: Metadata = {
  title: "After Hours — City Preview",
  description:
    "A continuous winter-night journey through four connected city districts.",
  robots: { index: false, follow: false },
};
export default function CityPreviewPage() {
  return <CityPreview />;
}
