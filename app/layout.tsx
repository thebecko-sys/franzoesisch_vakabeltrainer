import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Französisch Vokabeltrainer 5.–7. Klasse",
  description: "Mobiler Karteikarten-Trainer für Französisch in den Klassen 5 bis 7.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
