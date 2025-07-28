"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Star, Check, AlertTriangle } from "lucide-react"
import { Montserrat } from "next/font/google"
import { useState, useEffect } from "react"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
})

export default function PresellPage() {
  const [userCount, setUserCount] = useState(1688)

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUserCount((prev) => {
          // Simula incrementos realistas entre 1-3 usuários a cada 3-8 segundos
          const increment = Math.floor(Math.random() * 3) + 1
          return prev + increment
        })
      },
      Math.random() * 5000 + 3000,
    ) // Entre 3-8 segundos

    return () => clearInterval(interval)
  }, [])

  const handleTelegramClick = () => {
    // Track Meta Pixel event when button is clicked
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead")
    }
  }

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center px-2 ${montserrat.className}`}
      style={{ minHeight: "100vh", width: "100vw" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/background-gemeas.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#ff91e4]/80 via-[#ff91e4]/30 to-[#ff91e4]/10 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-lg w-full">
        {/* Profile Image */}
        <div className="mb-3 sm:mb-4">
          <img
            src="/images/profile-gemeas-final.jpg"
            alt="Gêmeas Scarlatt"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto border-2 border-pink-400 shadow-lg object-cover"
            style={{
              filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.8))",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
            }}
          />
        </div>

        {/* Main Headline */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight md:text-4xl"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)" }}
        >
          GÊMEAS{" "}
          <span
            className="drop-shadow-lg text-[rgba(255,145,228,1)]"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)" }}
          >
            SCARLATT
          </span>
        </h1>

        {/* Simple Description */}
        <p className="mb-6 sm:mb-8 text-white text-xs">ACESSO INSTANTÂNEO AO CONTEÚDO EXCLUSIVO</p>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 mb-3 sm:mb-4 text-white">
          <div className="flex items-center gap-1">
            <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-black" />
            <span className="font-semibold text-xs sm:text-sm">
              <span className="font-extrabold" style={{ fontFamily: "Montserrat", fontWeight: 800 }}>
                {userCount}
              </span>{" "}
              Usuários
            </span>
          </div>
          <div className="hidden sm:block w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="flex items-center gap-0.5">
            <Star className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-xs sm:text-sm">4.9/5</span>
          </div>
        </div>

        {/* Main CTA */}
        <a
          href="https://t.me/+pZ9uqWjcpflhY2Ix"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTelegramClick}
        >
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:from-[#006699] hover:to-[#0088cc] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-lg sm:text-xl shadow-2xl transform hover:scale-105 transition-all duration-200 mb-4"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            VER NO TELEGRAM
          </Button>
        </a>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="bg-transparent text-white">Instantâneo</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-white">Privado</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-white">Sem Compromisso</span>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
          ÚLTIMAS VAGAS DO GRUPO
        </div>
      </div>

      {/* Online Counter */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/70 text-white px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold">2.847</div>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            online
          </div>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: any
  }
}
