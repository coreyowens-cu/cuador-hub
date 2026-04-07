import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kvStore } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });

  try {
    const [row] = await db
      .select({ value: kvStore.value })
      .from(kvStore)
      .where(eq(kvStore.key, key))
      .limit(1);

    return NextResponse.json({ key, value: row?.value ?? null });
  } catch (e) {
    console.error("GET store error:", e);
    return NextResponse.json({ key, value: null });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });

  try {
    await db
      .insert(kvStore)
      .values({ key, value, updatedAt: new Date(), updatedBy: session.user.id })
      .onConflictDoUpdate({
        target: kvStore.key,
        set: { value, updatedAt: new Date(), updatedBy: session.user.id },
      });

    return NextResponse.json({ key, ok: true });
  } catch (e) {
    console.error("POST store error:", e);
    return NextResponse.json({ ok: false });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  try {
    if (key) {
      await db.delete(kvStore).where(eq(kvStore.key, key));
    }
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ deleted: false });
  }
}
