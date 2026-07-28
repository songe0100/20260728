import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const endpoint = url ? `${url}/rest/v1/seteuk_drafts` : "";

export async function GET() {
  if (!endpoint || !key) return NextResponse.json([]);
  const response = await fetch(`${endpoint}?select=*&order=created_at.desc`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Supabase 조회에 실패했습니다." }, { status: 502 });
  return NextResponse.json(await response.json());
}

export async function POST(request: Request) {
  if (!endpoint || !key) return NextResponse.json({ configured: false }, { status: 200 });
  const body = await request.json();
  const response = await fetch(endpoint, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) });
  if (!response.ok) return NextResponse.json({ error: "Supabase 저장에 실패했습니다." }, { status: 502 });
  return NextResponse.json((await response.json())[0]);
}
