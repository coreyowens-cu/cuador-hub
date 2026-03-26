import "./globals.css";

export const metadata = {
  title: "North Star Hub — CÚRADOR Brands",
  description: "Marketing OS for CÚRADOR Brands — Headchange, Bubbles, SafeBet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
