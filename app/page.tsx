"use client"

import { useState, useEffect } from "react"
import { Users, Eye, Check, Lock, ChevronDown } from "lucide-react"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export default function CheckoutPage() {
  const [userCount, setUserCount] = useState(1247)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("monthly")

  const FB_ACCESS_TOKEN =
    "EAAJ6bVYk96kBPtG7OmkBoNHaw6HN1EB5BlLeFp51NAskuyxWFIV86Qqho64mwlfcNYVH6fWHRPZBL6boFtY5TTTZA3H15y3GIxZCEuvC8wBtZCyi6hvWVwPPjZA9rXlLFqr97VbCPZCfXzmF8xKzrVk7ncXm0U111ZCvYziOaU7yFWyp0TZB2ebNgKQZCMA9zWQZDZD"
  const PIXEL_ID = "2057231185018157"

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const sendConversionEvent = async (eventName: string) => {
    try {
      const eventData = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: window.location.href,
            action_source: "website",
            user_data: {
              client_user_agent: navigator.userAgent,
              fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || "",
              fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || "",
            },
          },
        ],
        access_token: FB_ACCESS_TOKEN,
      }
      await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error("Error sending conversion event:", error)
    }
  }

  const handleSubscribe = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout")
    }
    sendConversionEvent("InitiateCheckout")
    window.open("https://privacy.com.br/checkout/gemeasscarlatt", "_blank")
  }

  const plans = {
    monthly: { price: "29,90", original: "49,90", period: "/mes", discount: "40% OFF", savings: "" },
    quarterly: { price: "24,90", original: "49,90", period: "/mes", discount: "50% OFF", savings: "Economize R$75" },
    yearly: { price: "19,90", original: "49,90", period: "/mes", discount: "60% OFF", savings: "Economize R$360" },
  }

  const currentPlan = plans[selectedPlan]

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      <div className="relative w-full h-48 sm:h-56 md:h-64">
        <img
          src="https://i.postimg.cc/XvTzcSDy/Quality-Restoration-Ultra-HD-Design-sem-nome.jpg"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Profile Section */}
      <div className="relative max-w-md mx-auto px-4 -mt-16">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <img
            src="/images/profile-gemeas-final.jpg"
            alt="Gemeas Scarlatt"
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl"
          />

          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl text-gray-900">Gemeas Scarlatt</h1>
              <div className="bg-[#1d9bf0] rounded-full p-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <img src="https://img.icons8.com/color/20/000000/18-plus.png" alt="+18" className="w-5 h-5" />
            </div>
            <p className="text-gray-500 text-sm mt-1">@gemeas_scarlatt</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{userCount.toLocaleString()} assinantes</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm">142 midias</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-600 text-sm text-center mt-4 leading-relaxed max-w-sm">
            {"Gemeas identicas por fora... mas completamente diferentes no que mostram no privado. Vem conhecer nosso lado +18"}
          </p>
        </div>

        {/* Plan Selection */}
        <div className="mt-8 space-y-3">
          <h2 className="text-gray-900 text-base text-center mb-4">Escolha seu plano</h2>

          {/* Monthly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              selectedPlan === "monthly"
                ? "border-[#FF6B00] bg-[#FF6B00]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "monthly" ? "border-[#FF6B00]" : "border-gray-300"
                }`}
              >
                {selectedPlan === "monthly" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />}
              </div>
              <div className="text-left">
                <p className="text-gray-900 text-sm">Mensal</p>
                <p className="text-gray-400 text-xs line-through">R$ {plans.monthly.original}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">{plans.monthly.discount}</span>
              <p className="text-gray-900 text-sm">
                R$ {plans.monthly.price}
                <span className="text-gray-400 text-xs">{plans.monthly.period}</span>
              </p>
            </div>
          </button>

          {/* Quarterly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan("quarterly")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              selectedPlan === "quarterly"
                ? "border-[#FF6B00] bg-[#FF6B00]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "quarterly" ? "border-[#FF6B00]" : "border-gray-300"
                }`}
              >
                {selectedPlan === "quarterly" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />}
              </div>
              <div className="text-left">
                <p className="text-gray-900 text-sm">Trimestral</p>
                <p className="text-gray-400 text-xs line-through">R$ {plans.quarterly.original}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">{plans.quarterly.discount}</span>
              <p className="text-gray-900 text-sm">
                R$ {plans.quarterly.price}
                <span className="text-gray-400 text-xs">{plans.quarterly.period}</span>
              </p>
            </div>
          </button>

          {/* Yearly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan("yearly")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 relative ${
              selectedPlan === "yearly"
                ? "border-[#FF6B00] bg-[#FF6B00]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="absolute -top-2.5 left-4 bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">
              Mais popular
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "yearly" ? "border-[#FF6B00]" : "border-gray-300"
                }`}
              >
                {selectedPlan === "yearly" && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />}
              </div>
              <div className="text-left">
                <p className="text-gray-900 text-sm">Anual</p>
                <p className="text-gray-400 text-xs line-through">R$ {plans.yearly.original}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">{plans.yearly.discount}</span>
              <p className="text-gray-900 text-sm">
                R$ {plans.yearly.price}
                <span className="text-gray-400 text-xs">{plans.yearly.period}</span>
              </p>
            </div>
          </button>
        </div>

        {/* Subscribe Button */}
        <button
          type="button"
          onClick={handleSubscribe}
          className="w-full mt-6 py-4 rounded-xl text-white text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
          }}
        >
          Assinar por R$ {currentPlan.price}{currentPlan.period}
        </button>

        {/* Savings info */}
        {currentPlan.savings && (
          <p className="text-[#FF6B00] text-xs text-center mt-2">{currentPlan.savings}</p>
        )}

        {/* Security & Info */}
        <div className="mt-6 space-y-3 pb-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Lock className="w-3 h-3" />
            <span>Pagamento seguro e sigiloso</span>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
              <span className="text-gray-700 text-sm">Acesso a todo conteudo exclusivo</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
              <span className="text-gray-700 text-sm">Fotos e videos diarios</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
              <span className="text-gray-700 text-sm">Chat direto com as gemeas</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
              <span className="text-gray-700 text-sm">Cancele quando quiser</span>
            </div>
          </div>

          {/* FAQ */}
          <details className="bg-gray-50 rounded-xl border border-gray-100">
            <summary className="flex items-center justify-between p-4 cursor-pointer text-gray-700 text-sm">
              Como funciona?
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </summary>
            <div className="px-4 pb-4 text-gray-500 text-xs leading-relaxed">
              {"Escolha seu plano, finalize o pagamento e tenha acesso imediato a todo conteudo exclusivo. O pagamento e recorrente e voce pode cancelar a qualquer momento."}
            </div>
          </details>

          <details className="bg-gray-50 rounded-xl border border-gray-100">
            <summary className="flex items-center justify-between p-4 cursor-pointer text-gray-700 text-sm">
              {"E seguro?"}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </summary>
            <div className="px-4 pb-4 text-gray-500 text-xs leading-relaxed">
              {"Sim! Todos os pagamentos sao processados de forma segura e sigilosa. Nenhuma informacao aparece na fatura do cartao."}
            </div>
          </details>
        </div>
      </div>

      {/* Meta Pixel Code */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2057231185018157');
            fbq('track', 'PageView');
          `,
        }}
      />
    </div>
  )
}
