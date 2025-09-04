import { NextRequest, NextResponse } from "next/server";
import Moralis from "moralis";

export const runtime = "nodejs"; // precisa de Node p/ usar env secreta e SDK

// $FUCK
const FUCK_MINT = "BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump";
// limiar do boost (x10) => >= 4M
const FUCK_BOOST_THRESHOLD = 4_000_000;

const MORALIS_API_KEY = process.env.MORALIS_API_KEY!;

function bad(res: any, status = 400) {
  return NextResponse.json(res, { status });
}

function toNumberSafe(x: any): number {
  if (x == null) return 0;
  if (typeof x === "number") return Number.isFinite(x) ? x : 0;
  if (typeof x === "string") {
    const s = x.replace(/,/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// Evita chamar Moralis.start() mais de uma vez em dev
let moralisStarted = false;
async function ensureMoralis() {
  if (moralisStarted) return;
  if (!MORALIS_API_KEY) throw new Error("MORALIS_API_KEY not set");
  await Moralis.start({ apiKey: MORALIS_API_KEY });
  moralisStarted = true;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = (searchParams.get("wallet") || "").trim();
    if (!wallet) return bad({ ok: false, error: "missing_wallet" });

    // 1) Tenta via SDK: account.getPortfolio (tokens + nfts)
    try {
      await ensureMoralis();

      const resp = await Moralis.SolApi.account.getPortfolio({
        address: wallet,
        network: "mainnet",
        nftMetadata: false,
        mediaItems: false,
        excludeSpam: false,
      });

      const tokens: any[] = resp?.raw?.tokens || [];
      const t = tokens.find((x) => x?.mint === FUCK_MINT);

      if (t) {
        // SDK normalmente traz:
        // amountRaw: base units (string), amount: UI (string), decimals: number
        const decimals = toNumberSafe(t.decimals);
        let amountUI = 0;

        // Preferir "amount" (UI). Se não tiver, calcular a partir do "amountRaw".
        if (t.amount != null) {
          amountUI = toNumberSafe(t.amount);
        } else if (t.amountRaw != null) {
          const raw = toNumberSafe(t.amountRaw);
          amountUI = decimals ? raw / Math.pow(10, decimals) : raw;
        }

        const boost = amountUI >= FUCK_BOOST_THRESHOLD;
        return NextResponse.json({
          ok: true,
          hasToken: amountUI > 0,
          amount: amountUI,
          decimals,
          boost,
          source: "moralis-sdk",
        });
      }
      // se não achou pelo SDK, cai no fallback REST abaixo
    } catch (e) {
      // segue para o fallback REST
      // console.error("[check_sol_token] SDK fallback:", e);
    }

    // 2) Fallback REST (tokens endpoint)
    if (!MORALIS_API_KEY) return bad({ ok: false, error: "missing_moralis_key" }, 500);

    const url = `https://solana-gateway.moralis.io/account/mainnet/${wallet}/tokens`;
    const r = await fetch(url, {
      headers: { accept: "application/json", "X-API-Key": MORALIS_API_KEY },
      cache: "no-store",
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return bad({ ok: false, error: "moralis_error", status: r.status, detail: text || undefined }, 502);
    }

    const list: any[] = await r.json();
    const tt = Array.isArray(list) ? list.find((x) => x?.mint === FUCK_MINT) : null;

    if (!tt) {
      return NextResponse.json({
        ok: true,
        hasToken: false,
        amount: 0,
        decimals: 0,
        boost: false,
        source: "rest",
      });
    }

    // Moralis REST pode trazer:
    // - uiAmountString (string UI)
    // - uiAmount (number UI)
    // - amount (pode ser UI em string)
    // - amount + decimals como base units
    let ui = 0;

    if (tt.uiAmountString != null) {
      ui = toNumberSafe(tt.uiAmountString);
    } else if (tt.uiAmount != null) {
      ui = toNumberSafe(tt.uiAmount);
    } else {
      const raw = toNumberSafe(tt.amount ?? tt.balance ?? tt.value);
      const dec = toNumberSafe(tt.decimals ?? tt.token_info?.decimals ?? 0);

      // Heurística: se "raw" for gigantesco em relação a "dec", assumimos base units.
      // Caso contrário, tratamos "raw" como UI (resolve o caso em que Moralis já manda UI).
      if (dec > 0 && raw >= Math.pow(10, dec + 3)) {
        ui = raw / Math.pow(10, dec);
      } else {
        ui = raw;
      }
    }

    const boost = ui >= FUCK_BOOST_THRESHOLD;

    return NextResponse.json({
      ok: true,
      hasToken: ui > 0,
      amount: ui,
      decimals: toNumberSafe(tt.decimals ?? tt.token_info?.decimals ?? 0),
      boost,
      source: "rest",
    });
  } catch (e: any) {
    return bad({ ok: false, error: String(e?.message || e) }, 500);
  }
}
