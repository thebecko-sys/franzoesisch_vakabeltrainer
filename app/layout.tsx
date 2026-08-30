import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Französisch Vokabeltrainer 7. Klasse",
  description: "Mobiler Karteikarten-Trainer für Französisch in der 7. Klasse.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
