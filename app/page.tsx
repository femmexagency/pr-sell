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
          backgroundImage: `url('https://i.postimg.cc/rpt9nM4F/Quality-Restoration-Ultra-HD-Captura-de-Tela-2025-07-29-a-s-19-19-49.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          width: "100vw",
          height: "100vh",
        }}
      >
        {/* Black Gradient with Backdrop Blur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-lg w-full">
        {/* Profile Image */}
        <div className="mb-3 sm:mb-4">
          <img
            src="/images/profile-gemeas-final.jpg"
            alt="Gêmeas Scarlatt"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto border-2 border-[#FF0000] object-cover"
          />
        </div>

        {/* Main Headline */}
        <h1
          className="text-lg sm:text-2xl font-bold text-white mb-4 leading-tight md:text-3xl uppercase"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)" }}
        >
          O QUE ELAS FAZEM{" "}
          <span
            className="drop-shadow-lg text-[rgba(255,0,0,1)]"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)" }}
          >
            JUNTAS
          </span>{" "}
          NINGUÉM ESPERA. CLIQUE E{" "}
          <span
            className="drop-shadow-lg text-[rgba(255,0,0,1)]"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)" }}
          >
            DESCUBRA
          </span>
          .
        </h1>

        {/* Image below headline */}
        <div className="mb-3 sm:mb-4 relative">
          <img
            src="https://i.postimg.cc/XvTzcSDy/Quality-Restoration-Ultra-HD-Design-sem-nome.jpg"
            alt="Design"
            className="mx-auto max-w-full h-auto"
            style={{
              filter: "blur(1px)",
              maxWidth: "300px",
              width: "100%",
            }}
          />
          {/* Watermark */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
            <Check className="w-3 h-3 text-blue-400" />
            <span className="font-semibold">gemeas_scarlatt</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* User Count - Custom Badge Style */}
          <div className="bg-gradient-to-r from-[#ff0000] to-[#be0000] text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/20">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <span className="text-xs sm:text-sm font-bold">
                <span className="font-black text-base sm:text-lg" style={{ fontFamily: "Montserrat", fontWeight: 900 }}>
                  {userCount}
                </span>{" "}
                <span className="font-semibold">Usuários</span>
              </span>
            </div>
          </div>

          {/* Rating - Custom Card Style */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-400 text-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white/30">
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-black text-black" />
              <span className="font-black text-xs sm:text-sm">
                <span className="text-base sm:text-lg">4.9</span>
                <span className="text-xs font-bold">/5</span>
              </span>
            </div>
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
            className="w-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:from-[#006699] hover:to-[#0088cc] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base shadow-2xl transform hover:scale-105 transition-all duration-200 mb-4 border-2 border-[#66c2ff]"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            QUERO VER AS PRÉVIAS AGORA
          </Button>
        </a>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="bg-transparent text-white italic">Liberado agora. Mas só por pouco tempo.</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-white italic">Privado</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-white italic">Prévias exclusivas para você</span>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse flex items-center gap-1 bg-[rgba(255,0,0,1)]">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
          ÚLTIMAS VAGAS DO GRUPO
        </div>
      </div>

      {/* Online Counter */}
      <div className="absolute bottom-16 right-4 sm:bottom-20 sm:right-6 bg-black/70 text-white px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm">
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
