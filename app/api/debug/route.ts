import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kvStore } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  // Test DB connection
  let dbOk = false;
  let dbError = "";
  try {
    await db.select({ count: sql`count(*)` }).from(kvStore);
    dbOk = true;
  } catch (e: unknown) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    env: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    db: { ok: dbOk, error: dbError || undefined },
  });
}
