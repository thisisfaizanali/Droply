import { Caprasimo, Figtree } from "next/font/google";

export const fontHeading = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

export const fontBody = Figtree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});
