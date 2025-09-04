"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { request, AddressPurpose } from "sats-connect"

interface WalletSnapshot {
  wallet: string
  inscriptions?: { inscriptionId: string; inscriptionNumber: number }[]
  inscriptionsCount?: number // HoneyBadgers e Wizards
  amount?: number            // Organic Bitcorn
}

// ====== BOOST CONFIG ======
const FUCK_BOOST_THRESHOLD = 4_000_000  // precisa ter >= 4M $FUCK
const FUCK_MULTIPLIER = 10              // x10 allocation

export default function ClaimPage() {
  // Helpers
  const normalizeWalletAddress = (value: string | null | undefined) =>
    (value || "").trim().toLowerCase()

  const getInscriptionsCount = (snapshot?: WalletSnapshot) => {
    if (!snapshot) return 0
    if (typeof snapshot.inscriptionsCount === "number") return snapshot.inscriptionsCount
    if (Array.isArray(snapshot.inscriptions)) return snapshot.inscriptions.length
    return 0
  }

  const getBitcornAmount = (snapshot?: WalletSnapshot) => {
    if (!snapshot) return 0
    return typeof snapshot.amount === "number" ? snapshot.amount : 0
  }

  const [taprootAddress, setTaprootAddress] = useState<string | null>(null)
  const [solanaWallet, setSolanaWallet] = useState("")
  const [isEligible, setIsEligible] = useState(false)
  const [eligibilityDetails, setEligibilityDetails] = useState<string>("")
  const [eligibilitySource, setEligibilitySource] = useState<string>("") // NEW
  const [saved, setSaved] = useState(false)
  const [snapshotsLoaded, setSnapshotsLoaded] = useState(false)

  const [honeyBadgersSnapshot, setHoneyBadgersSnapshot] = useState<WalletSnapshot[]>([])
  const [unsanctionedSnapshot, setUnsanctionedSnapshot] = useState<WalletSnapshot[]>([])
  const [bitcornSnapshot, setBitcornSnapshot] = useState<WalletSnapshot[]>([])

  // $FUCK (via Moralis)
  const [hasFuckBoost, setHasFuckBoost] = useState(false) // true se >= 4M
  const [checkingSolana, setCheckingSolana] = useState(false)
  const [solanaFuckAmount, setSolanaFuckAmount] = useState<number | null>(null)

  // Carregar JSONs e normalizar wallets
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        console.time("loadSnapshots")
        const [honeyRes, unsanRes, bitcornRes] = await Promise.all([
          fetch("/honey_badgers.json"),
          fetch("/unsanctioned_wizards.json"),
          fetch("/organic_bitcorn.json"),
        ])
        const honey = (await honeyRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: normalizeWalletAddress(w.wallet),
        }))
        const unsan = (await unsanRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: normalizeWalletAddress(w.wallet),
        }))
        const bitcorn = (await bitcornRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: normalizeWalletAddress(w.wallet),
        }))

        setHoneyBadgersSnapshot(honey)
        setUnsanctionedSnapshot(unsan)
        setBitcornSnapshot(bitcorn)
        setSnapshotsLoaded(true)
        console.timeEnd("loadSnapshots")
      } catch (err) {
        console.error("Falha ao carregar snapshots:", err)
      }
    }
    loadSnapshots()
  }, [])

  // Verifica elegibilidade (OR pelos JSONs)
  const checkEligibility = useCallback(
    (address: string) => {
      if (!snapshotsLoaded) return

      const userAddress = normalizeWalletAddress(address)

      // HoneyBadgers
      const honeyWallet = honeyBadgersSnapshot.find((w) => w.wallet === userAddress)
      const honeyCount = getInscriptionsCount(honeyWallet)

      // Unsanctioned Wizards
      const unsanWallet = unsanctionedSnapshot.find((w) => w.wallet === userAddress)
      const unsanCount = getInscriptionsCount(unsanWallet)

      // Organic Bitcorn (do snapshot)
      const bitcornWallet = bitcornSnapshot.find((w) => w.wallet === userAddress)
      const bitcornAmount = getBitcornAmount(bitcornWallet)

      // OR: elegível se tiver qualquer um dos assets
      const eligible = honeyCount > 0 || unsanCount > 0 || bitcornAmount >= 1_000_000


      const details = [
        honeyCount ? `${honeyCount} HoneyBadgers` : null,
        unsanCount ? `${unsanCount} Unsanctioned Wizards` : null,
       bitcornAmount >= 1_000_000 ? `${new Intl.NumberFormat().format(bitcornAmount)} Organic Bitcorn` : null

      ]
        .filter(Boolean)
        .join(", ")

      // Fonte da elegibilidade (prioridade: HB > WZ > Bitcorn — ajuste se quiser)
      let source = ""
      if (honeyCount > 0) source = "HoneyBadgers"
      else if (unsanCount > 0) source = "Unsanctioned Wizards"
      else if (bitcornAmount > 0) source = "Organic Bitcorn"

      setIsEligible(eligible)
      setEligibilityDetails(details || "No assets found")
      setEligibilitySource(source)
    },
    [snapshotsLoaded, honeyBadgersSnapshot, unsanctionedSnapshot, bitcornSnapshot]
  )

  // Rechecar quando snapshots carregarem
  useEffect(() => {
    if (snapshotsLoaded && taprootAddress) {
      checkEligibility(taprootAddress)
    }
  }, [snapshotsLoaded, taprootAddress, checkEligibility])

  // Checar localStorage para já travar UX se já submeteu essa taproot
  useEffect(() => {
    if (!taprootAddress) {
      setSaved(false)
      return
    }
    const key = `claim_submitted_${taprootAddress}`
    if (localStorage.getItem(key)) setSaved(true)
  }, [taprootAddress])

  // API interna (Moralis por trás) — checa saldo do $FUCK
  const checkSolanaToken = async (wallet: string) => {
    try {
      const w = wallet.trim()
      if (!w) return { hasToken: false, amount: 0, boost: false }
      setCheckingSolana(true)
      const res = await fetch(`/api/check_sol_token?wallet=${encodeURIComponent(w)}`)
      if (!res.ok) {
        console.error("[checkSolanaToken] bad status:", res.status)
        return { hasToken: false, amount: 0, boost: false }
      }
      const data = await res.json()
      const amount = typeof data?.amount === "number" ? data.amount : Number(data?.amount) || 0
      const boost = amount >= FUCK_BOOST_THRESHOLD
      return { hasToken: amount > 0, amount, boost }
    } catch (err) {
      console.error("Erro ao checar token Solana:", err)
      return { hasToken: false, amount: 0, boost: false }
    } finally {
      setCheckingSolana(false)
    }
  }

  // Envia para o Supabase via nossa API
  async function submitToDB(params: {
    taproot: string
    eligibility_source: string
    solana_wallet: string
    fuck_amount: number
    has_boost: boolean
  }) {
    const res = await fetch("/api/submit_claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    return res.json()
  }

  // Conectar Xverse
  const connectXverse = async () => {
    try {
      const response = await request("wallet_connect", {
        addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals],
        message: "Please connect your Xverse wallet to claim",
      })

      if (response.status === "success") {
        const ordinalsAddress = response.result.addresses.find(
          (addr) => addr.purpose === AddressPurpose.Ordinals
        )
        if (ordinalsAddress && ordinalsAddress.address.startsWith("bc1p")) {
          const cleanedAddress = normalizeWalletAddress(ordinalsAddress.address)
          setTaprootAddress(cleanedAddress)
          checkEligibility(cleanedAddress)
        } else {
          alert("No Taproot (Ordinals) address found in Xverse Wallet")
        }
      } else {
        alert("Connection error: " + response.error.message)
      }
    } catch (err) {
      console.error("Failed to connect Xverse:", err)
      alert("Failed to connect Xverse. Check console for details.")
    }
  }

  // Desconectar wallet
  const disconnect = () => {
    setTaprootAddress(null)
    setIsEligible(false)
    setSaved(false)
    setSolanaWallet("")
    setEligibilityDetails("")
    setEligibilitySource("")
    setHasFuckBoost(false)
    setSolanaFuckAmount(null)
  }

  // Salvar wallet Solana (checagem $FUCK + submit no DB + trava reenvio)
  // Salvar wallet Solana (checagem $FUCK + submit no DB + trava reenvio)
const saveSolanaWallet = async () => {
  const w = solanaWallet.trim()
  if (!w) return alert("Please enter a valid Solana wallet")
  if (!taprootAddress) return alert("Connect your Xverse first")

  // trava UX por localStorage
  const key = `claim_submitted_${taprootAddress}`
  if (localStorage.getItem(key)) {
    setSaved(true)
    return alert("You have already submitted this Taproot wallet.")
  }

  // Checa $FUCK via API Moralis
  const { hasToken, amount, boost } = await checkSolanaToken(w)
  setHasFuckBoost(!!boost)
  setSolanaFuckAmount(hasToken ? amount : 0)

  // Enviar ao backend (Supabase)
  const payload = {
    taproot: taprootAddress,
    eligibility_source: eligibilitySource || "Unknown",
    solana_wallet: w,
    fuck_amount: Number(amount) || 0,
    has_boost: !!boost,
  }

  try {
    const resp = await submitToDB(payload)

    if (resp?.ok) {
      localStorage.setItem(key, "1")
      setSaved(true)
      const nf = new Intl.NumberFormat()
      alert(
        `Solana wallet saved! ${
          boost ? `BOOST x${FUCK_MULTIPLIER} unlocked — hodl: ${nf.format(amount)} $FUCK.` : ""
        }`
      )
    } else if (resp?.error === "already_exists") {
      localStorage.setItem(key, "1")
      setSaved(true)
      alert("This Taproot wallet is already registered (1 submission only).")
    } else if (resp?.error === "solana_wallet_in_use") {
      alert("This Solana wallet is already linked to another Taproot. Please use a different Solana wallet.")
    } else {
      console.error("Submit error:", resp)
      alert("Failed to save your claim. Please try again.")
    }
  } catch (err) {
    console.error("Submit error:", err)
    alert("Network error while saving your claim.")
  }
}


  // Copiar endereço taproot
  const copyAddress = () => {
    if (taprootAddress) {
      navigator.clipboard.writeText(taprootAddress)
      alert("Taproot address copied!")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-red-700 via-red-600 to-orange-400 text-white">
      <Image
        src="/fcc-logo.jpg"
        width={120}
        height={120}
        alt="Token Logo"
        className="mb-6 rounded-full shadow-lg spin-3d"
      />

      <h1 className="text-3xl font-bold mb-4">Claim</h1>

      {!taprootAddress ? (
        <button
          onClick={connectXverse}
          className="px-8 py-4 font-bold rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition"
        >
          Connect Xverse Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="font-mono text-lg break-all">Taproot: {taprootAddress}</p>

          <button
            onClick={copyAddress}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition"
          >
            Copy Address
          </button>

          <button
            onClick={disconnect}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Disconnect
          </button>

          {isEligible ? (
            <div className="mt-6 flex flex-col gap-2 w-full text-center">
              <p className="text-green-200 font-bold">
                ✅ You are eligible! ({eligibilityDetails})
              </p>

              {/* Campo para salvar wallet Solana e liberar BOOST x10 */}
              <input
                type="text"
                placeholder="Your Solana wallet"
                className="w-full px-4 py-2 rounded text-black"
                value={solanaWallet}
                disabled={saved}
                onChange={(e) => setSolanaWallet(e.target.value)}
              />

              <button
                onClick={saveSolanaWallet}
                disabled={saved || checkingSolana}
                className={`px-4 py-2 rounded ${
                  saved || checkingSolana ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {checkingSolana ? "Checking $FUCK..." : saved ? "Wallet already saved" : "Save Solana Wallet"}
              </button>

              {/* Detalhes do $FUCK e copy engraçada do x10 */}
              {saved && (
                <div className="mt-2 space-y-1">
                  {solanaFuckAmount !== null && (
                    <p className="text-sm">
                      Detected $FUCK balance:{" "}
                      <span className="font-semibold">
                        {new Intl.NumberFormat().format(solanaFuckAmount)}
                      </span>
                    </p>
                  )}

                  <p className="text-yellow-100 text-sm">
                    <strong>Hodl more than {new Intl.NumberFormat().format(FUCK_BOOST_THRESHOLD)} $FUCK</strong>{" "}
                    in your claiming wallet to receive <strong>{FUCK_MULTIPLIER} FUCKING TIMES</strong> the base allocation.
                  </p>

                  {hasFuckBoost && (
                    <p className="text-yellow-200 font-extrabold text-base">
                      ⚡ BOOST UNLOCKED: your airdrop will be x{FUCK_MULTIPLIER}!
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-6 text-red-200 text-center">
              ❌ You are not eligible ({eligibilityDetails || "No assets found"})
            </p>
          )}
        </div>
      )}
    </div>
  )
}
