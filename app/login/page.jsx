"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div style={{ position: "fixed", inset: 0, background: "#07070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Logo */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: ".14em", color: "#ede8df", textTransform: "uppercase", marginBottom: 6 }}>
          C<span style={{ color: "#3bb54a" }}>U</span>RADOR
        </div>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#8a87a8" }}>Marketing OS</div>
      </div>

      <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "32px 36px", width: 360, boxShadow: "0 24px 64px rgba(0,0,0,.5)" }}>
        <div style={{ fontSize: 14, color: "#ede8df", fontWeight: 600, marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 12, color: "#8a87a8", marginBottom: 24 }}>Sign in with your CURADOR Google account to continue.</div>

        {error && (
          <div style={{ fontSize: 12, color: "#e07b6a", background: "rgba(224,123,106,.08)", border: "1px solid rgba(224,123,106,.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            {error === "AccessDenied"
              ? "Access denied. Only @curadorbrands.com accounts and approved emails can sign in."
              : "Something went wrong. Please try again."}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{ width: "100%", padding: "11px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #c9a84c, #a07030)", color: "#07070f", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
