"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Twitter, MessageCircle } from "lucide-react"
import Image from "next/image"
import Head from "next/head"

export default function FuckCoinCashLanding() {
  const [copied, setCopied] = useState(false)
  const [showChart, setShowChart] = useState(false)
   const [showSwap, setShowSwap] = useState(false)

  const contractAddress = "BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 via-red-600 to-orange-400 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/50 via-red-600/40 to-orange-500/40" />

               <Head>
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
</Head>


        {/* Logo */}
        <div className="relative z-20 mb-8">
          <Image
            src="/fcc-logo.jpg" // coloque sua logo FCC aqui em /public/fcc-logo.png
            alt="FuckCoinCash Logo"
            width={120}
            height={120}
            className="rounded-full shadow-lg"
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 text-lg px-6 py-2 bg-white/20 text-white border-white/40">
            FuckCoinCash
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black mb-6 drop-shadow-lg">
            From Old Omni to New Legend
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discovered in the depths of the blockchain. Hidden in plain sight since 2018.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button
              size="lg"
               className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
              onClick={() => setShowSwap(!showSwap)}
            >
              {showSwap ? "Hide Swap" : "Buy $fuck Now"}
            </Button>
            <Button
              onClick={() => setShowChart(!showChart)}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
            >
              {showChart ? "Hide Chart" : "View Chart"}
            </Button>
          </div>
        </div>
      </section>
         {/* Swap Section */}
      {showSwap && (
        <section className="py-12 px-4 flex justify-center">
          <div className="w-full max-w-2xl">
          <iframe
  src="https://jup.ag/swap/SOL-BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump?inputMint=So11111111111111111111111111111111111111112&outputMint=BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump"
  width="100%"
  height="600"
  style={{ border: "0", borderRadius: "12px" }}
  allowFullScreen
></iframe>
          </div>
        </section>
      )}

      {/* Chart Section */}
      {showChart && (
        <section className="py-16 px-4 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                src="https://dexscreener.com/solana/2tbchjwhzjgyu4rxtptahfgud3znzspn4yswbxi2gb4n?embed=1&theme=dark&info=0&trades=0"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Lore Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-12">The Story</h2>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-6 text-lg leading-relaxed">
                <p>Back in 2018, a mysterious figure stumbled upon an old Omni coin once associated with the Tether deployer...</p>
                <p>
                 Inspired by it, he decided to bring it back to life—and thus FuckCoinCash was reborn..{" "}
            
                </p>
                <p>
                A revival of a forgotten legend, ready to surprise anyone daring enough to mint it
                </p>
                <div className="bg-black/20 p-6 rounded-lg border border-white/20">
                  <p className="font-semibold mb-2">Archive:</p>
                  <a
                    href="https://archive.is/pwKpY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-2 text-yellow-300"
                  >
                    https://archive.is/pwKpY
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contract Address Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12">Contract Address</h2>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-8">
              <p className="text-sm opacity-70 mb-4">Contract Address (CA)</p>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/30 p-4 rounded-lg">
                <code className="font-mono text-sm md:text-base break-all flex-1">{contractAddress}</code>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12">Join the Community</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <CardContent className="p-8 text-center">
                <Twitter className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">Twitter</h3>
                <p className="opacity-80">Follow for updates</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">Telegram</h3>
                <p className="opacity-80">Join the chat</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="opacity-80 mb-4">FuckCoinCash ($fuck) - The token that was always there</p>
          <p className="text-sm opacity-60">
            This is a meme token with no intrinsic value or expectation of financial return.
          </p>
        </div>
      </footer>
    </div>
  )
}
