"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { request, AddressPurpose } from "sats-connect"

interface WalletSnapshot {
  wallet: string
  inscriptions?: { inscriptionId: string; inscriptionNumber: number }[]
  inscriptionsCount?: number // HoneyBadgers e Wizards
  amount?: number           // Organic Bitcorn
}

export default function ClaimPage() {
  const [taprootAddress, setTaprootAddress] = useState<string | null>(null)
  const [solanaWallet, setSolanaWallet] = useState("")
  const [isEligible, setIsEligible] = useState(false)
  const [eligibilityDetails, setEligibilityDetails] = useState<string>("")
  const [saved, setSaved] = useState(false)
  const [snapshotsLoaded, setSnapshotsLoaded] = useState(false)

  const [honeyBadgersSnapshot, setHoneyBadgersSnapshot] = useState<WalletSnapshot[]>([])
  const [unsanctionedSnapshot, setUnsanctionedSnapshot] = useState<WalletSnapshot[]>([])
  const [bitcornSnapshot, setBitcornSnapshot] = useState<WalletSnapshot[]>([])

  // Carregar JSONs e limpar wallets
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        const [honeyRes, unsanRes, bitcornRes] = await Promise.all([
          fetch("/honey_badgers.json"),
          fetch("/unsanctioned_wizards.json"),
          fetch("/organic_bitcorn.json")
        ])
        const honey = (await honeyRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: w.wallet?.trim().toLowerCase()
        }))
        const unsan = (await unsanRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: w.wallet?.trim().toLowerCase()
        }))
        const bitcorn = (await bitcornRes.json()).map((w: WalletSnapshot) => ({
          ...w,
          wallet: w.wallet?.trim().toLowerCase()
        }))

        setHoneyBadgersSnapshot(honey)
        setUnsanctionedSnapshot(unsan)
        setBitcornSnapshot(bitcorn)
        setSnapshotsLoaded(true)

        console.log("Snapshots carregados e normalizados")
      } catch (err) {
        console.error("Falha ao carregar snapshots:", err)
      }
    }
    loadSnapshots()
  }, [])

  // Verifica elegibilidade
  const checkEligibility = (address: string) => {
    if (!snapshotsLoaded) return

    const userAddress = address.trim().toLowerCase()

    // HoneyBadgers
    const honeyWallet = honeyBadgersSnapshot.find(w => w.wallet === userAddress)
    const honeyCount = honeyWallet?.inscriptionsCount || 0

    // Unsanctioned Wizards
    const unsanWallet = unsanctionedSnapshot.find(w => w.wallet === userAddress)
    const unsanCount = unsanWallet?.inscriptionsCount || 0

    // Organic Bitcorn
    const bitcornWallet = bitcornSnapshot.find(w => w.wallet === userAddress)
    const bitcornAmount = bitcornWallet?.amount || 0

    const eligible = honeyCount > 0 || unsanCount > 0 || bitcornAmount > 0

    const details = [
      honeyCount ? `${honeyCount} HoneyBadgers` : null,
      unsanCount ? `${unsanCount} Unsanctioned Wizards` : null,
      bitcornAmount ? `${bitcornAmount} Organic Bitcorn` : null
    ].filter(Boolean).join(", ")

    setIsEligible(eligible)
    setEligibilityDetails(details || "No assets found")

    console.log("Eligibility check:", eligible)
    console.log("Details:", details)
  }

  // Conectar Xverse
  const connectXverse = async () => {
    try {
      const response = await request("wallet_connect", {
        addresses: [AddressPurpose.Payment, AddressPurpose.Ordinals],
        message: "Please connect your Xverse wallet to claim"
      })

      if (response.status === "success") {
        const ordinalsAddress = response.result.addresses.find(
          addr => addr.purpose === AddressPurpose.Ordinals
        )
        if (ordinalsAddress && ordinalsAddress.address.startsWith("bc1p")) {
          const cleanedAddress = ordinalsAddress.address.trim().toLowerCase()
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
  }

  // Salvar wallet Solana
  const saveSolanaWallet = () => {
    if (!solanaWallet) return alert("Please enter a valid Solana wallet")
    console.log("Save record:", { taproot: taprootAddress, solana: solanaWallet })
    alert("Solana wallet saved successfully!")
    setSaved(true)
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
              <input
                type="text"
                placeholder="Your Solana wallet"
                className="w-full px-4 py-2 rounded text-black"
                value={solanaWallet}
                disabled={saved}
                onChange={e => setSolanaWallet(e.target.value)}
              />
              <button
                onClick={saveSolanaWallet}
                disabled={saved}
                className={`px-4 py-2 rounded ${
                  saved ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {saved ? "Wallet already saved" : "Save Solana Wallet"}
              </button>
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
