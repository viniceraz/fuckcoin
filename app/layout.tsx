import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FuckCoinCash ($fuck)",
  description:
    "Back in 2018, a mysterious figure stumbled upon an old Omni coin once associated with the Tether deployer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-red-700 via-red-600 to-orange-400 text-white font-sans">
        {children}
      </body>
    </html>
  )
}
