import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "MarketingOS — CÚRADOR Brands",
  description: "Marketing OS for CÚRADOR Brands — Headchange, Bubbles, SafeBet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
