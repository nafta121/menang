import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftKu — Manajemen Shift",
  description: "Jadwal tim yang lebih adil dan teratur",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
