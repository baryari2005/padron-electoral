// app/fonts.ts
import { Pacifico } from "next/font/google";
import { Homemade_Apple } from "next/font/google";

export const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
});

export const firmaFont = Homemade_Apple({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-firma",
});