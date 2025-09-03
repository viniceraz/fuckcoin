"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Twitter, MessageCircle, ArrowUp } from "lucide-react"
import Image from "next/image"
import Head from "next/head"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

export default function FuckCoinCashLanding() {
  const [copied, setCopied] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const contractAddress = "BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Componente para moedas caindo
  function FallingCoins() {
    const NUM_COINS = 15
    const [coins] = useState(
      Array.from({ length: NUM_COINS }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 20 + Math.random() * 20,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5
      }))
    )

    return (
      <>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            style={{
              position: "fixed",
              top: -coin.size,
              left: `${coin.x}%`,
              width: coin.size,
              height: coin.size,
              zIndex: 50,
            }}
            animate={{ y: "100vh", rotate: 360 }}
            transition={{
              duration: coin.duration,
              delay: coin.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Image
              src="/fcc-logo.png"
              width={coin.size}
              height={coin.size}
              alt="Coin"
            />
          </motion.div>
        ))}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 via-red-600 to-orange-400 text-white relative">
      {/* Moedas caindo */}
      <FallingCoins />

      <Head>
        <title>FuckCoinCash - The Coin Tether Doesn't Want You to Know About</title>
        <meta name="description" content="Discovered in the depths of the blockchain. Hidden in plain sight since 2018." />
        <meta property="og:title" content="FuckCoinCash ($fuck)" />
        <meta property="og:description" content="The Coin Tether Doesn't Want You to Know About" />
        <meta property="og:image" content="/fcc-logo.jpg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      </Head>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 text-sm">
          <span className="font-bold">$fuck</span>
          <div className="flex gap-4">
            <a href="#hero" className="hover:underline">Home</a>
            <button onClick={() => setShowSwap(prev => !prev)} className="hover:underline">Swap</button>
            <button onClick={() => setShowChart(prev => !prev)} className="hover:underline">Chart</button>
            <a href="#story" className="hover:underline">Story</a>
            <a href="#contract" className="hover:underline">Contract</a>
            <a href="#community" className="hover:underline">Community</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/50 via-red-600/40 to-orange-500/40" />

        {/* Logo girando */}
        <motion.div
          className="relative z-20 mb-8"
          animate={{ rotateY: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <Image
            src="/fcc-logo.jpg"
            alt="FuckCoinCash Logo"
            width={120}
            height={120}
            className="rounded-full shadow-lg"
          />
        </motion.div>

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Badge className="mb-6 text-lg px-6 py-2 bg-white/20 text-white border-white/40">
            FuckCoinCash
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black mb-6 drop-shadow-lg">
            The Coin Tether Doesn't Want You to Know About
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
        </motion.div>
      </section>

      {/* Swap Section */}
      {showSwap && (
        <section id="swap" className="py-12 px-4 flex justify-center">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <iframe
              src="https://jup.ag/swap/SOL-BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump?inputMint=So11111111111111111111111111111111111111112&outputMint=BU5HBa4zJvnfzrzmQ3FaZMBy6r4ZCCG4HULdmkFrpump"
              width="100%"
              height="600"
              style={{ border: "0", borderRadius: "12px" }}
              allowFullScreen
            />
          </motion.div>
        </section>
      )}

      {/* Chart Section */}
      {showChart && (
        <section id="chart" className="py-16 px-4 bg-black/20">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                src="https://dexscreener.com/solana/2tbchjwhzjgyu4rxtptahfgud3znzspn4yswbxi2gb4n?embed=1&theme=dark&info=0&trades=0"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* Story Section */}
      <section id="story" className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-black text-center mb-12">The Story</h2>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-6 text-lg leading-relaxed">
                <p>Back in 2025, a mysterious figure stumbled upon an old Omni coin once associated with the Tether deployer...</p>
                <p>Inspired by it, he decided to bring it back to life—and thus FuckCoinCash was reborn..</p>
                <p>A revival of a forgotten legend, ready to surprise anyone daring enough to mint it</p>
                <div className="bg-black/20 p-6 rounded-lg border border-white/20">
                  <p className="font-semibold mb-2">Archive:</p>
                  <a href="https://archive.is/pwKpY" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2 text-yellow-300">
                    https://archive.is/pwKpY
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Contract Section */}
      <section id="contract" className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
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
        </motion.div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 px-4 bg-black/20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-12">Join the Community</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <CardContent className="p-8 text-center">
                  <Twitter className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">Twitter</h3>
                  <p className="opacity-80">Follow for updates</p>
                </CardContent>
              </Card>
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer">
              <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">Telegram</h3>
                  <p className="opacity-80">Join the chat</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="opacity-80 mb-4">FuckCoinCash ($fuck) - The token that was always there</p>
          <p className="text-sm opacity-60">
            This is a meme token with no intrinsic value or expectation of financial return
                      </p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-red-600 hover:bg-red-700 shadow-lg border border-white/20"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  )
}

