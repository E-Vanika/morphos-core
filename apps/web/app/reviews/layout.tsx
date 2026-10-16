import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Client Reviews | Monika Glam Up",
  description: "Read client ratings and comments for Monika Glam Up bridal makeup and styling services.",
};

export default function ReviewsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
