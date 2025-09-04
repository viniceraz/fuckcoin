// app/api/submit_claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function validate(body: any) {
  const taproot = String(body?.taproot || "").trim().toLowerCase();
  const eligibility_source = String(body?.eligibility_source || "").trim();
  const solana_wallet = String(body?.solana_wallet || "").trim().toLowerCase();
  const fuck_amount = Number(body?.fuck_amount || 0);
  const has_boost = !!body?.has_boost;

  if (!taproot || !eligibility_source || !solana_wallet) {
    return { ok: false as const, error: "missing_fields" };
  }
  return { ok: true as const, data: { taproot, eligibility_source, solana_wallet, fuck_amount, has_boost } };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const user_agent = req.headers.get("user-agent") || "";

    const json = await req.json();
    const v = validate(json);
    if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("claims")
      .insert([{ ...v.data, ip, user_agent }]);

    if (error) {
      // 23505 = unique_violation; checamos a mensagem p/ saber qual índice
      if (error.code === "23505") {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("claims_taproot_key")) {
          return NextResponse.json({ ok: false, error: "already_exists" }, { status: 409 });
        }
        if (msg.includes("claims_solana_wallet_key")) {
          return NextResponse.json({ ok: false, error: "solana_wallet_in_use" }, { status: 409 });
        }
        // fallback geral
        return NextResponse.json({ ok: false, error: "unique_violation" }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
