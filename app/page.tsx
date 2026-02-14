"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Image, Film, Lock, Heart, MapPin, ChevronUp, ChevronDown, FileText, LayoutGrid, X, Copy, Check, Loader2 } from "lucide-react"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

type CheckoutStep = "closed" | "form" | "pix" | "success"

interface PlanInfo {
  label: string
  amount: number
  price: string
}

const PLANS: Record<string, PlanInfo> = {
  monthly: { label: "1 mes", amount: 1990, price: "R$ 19,90" },
  quarterly: { label: "3 meses (15% off)", amount: 5074, price: "R$ 50,74" },
  semester: { label: "6 meses (20% off)", amount: 9552, price: "R$ 95,52" },
}

const SYNC_API = "https://api.sync.com.br"
const SYNC_CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const SYNC_CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let tokenCache: { token: string; expiresAt: number } | null = null

async function getSyncToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 300000) {
    return tokenCache.token
  }

  const res = await fetch(`${SYNC_API}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SYNC_CLIENT_ID,
      client_secret: SYNC_CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    throw new Error("Falha na autenticacao")
  }

  const data = await res.json()
  const token = data.access_token || data.token || data.data?.access_token
  if (!token) throw new Error("Token nao retornado")

  tokenCache = {
    token,
    expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600000,
  }
  return token
}

export default function ProfilePage() {
  const [showPromos, setShowPromos] = useState(true)
  const [activeTab, setActiveTab] = useState<"posts" | "media">("posts")
  const [bioExpanded, setBioExpanded] = useState(false)

  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("closed")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [formData, setFormData] = useState({ name: "", email: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [copied, setCopied] = useState(false)
  const [formError, setFormError] = useState("")
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const FB_ACCESS_TOKEN =
    "EAAJ6bVYk96kBPtG7OmkBoNHaw6HN1EB5BlLeFp51NAskuyxWFIV86Qqho64mwlfcNYVH6fWHRPZBL6boFtY5TTTZA3H15y3GIxZCEuvC8wBtZCyi6hvWVwPPjZA9rXlLFqr97VbCPZCfXzmF8xKzrVk7ncXm0U111ZCvYziOaU7yFWyp0TZB2ebNgKQZCMA9zWQZDZD"
  const PIXEL_ID = "2057231185018157"

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

  const handlePlanClick = (planKey: string) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout")
    }
    sendConversionEvent("InitiateCheckout")
    setSelectedPlan(planKey)
    setCheckoutStep("form")
    setFormError("")
  }

  const handleSubmitForm = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Preencha todos os campos obrigatorios.")
      return
    }

    setIsLoading(true)
    setFormError("")

    try {
      const plan = PLANS[selectedPlan]
      const token = await getSyncToken()

      const pixPayload = {
        amount: plan.amount,
        paymentMethod: "PIX",
        customer: {
          cpf: "00000000000",
          name: formData.name,
          email: formData.email,
          phone: "",
        },
        pix: {
          expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        items: [
          {
            title: `Assinatura ${plan.label} - Gemeas Scarlatt`,
            unitPrice: plan.amount,
            quantity: 1,
            tangible: false,
          },
        ],
        metadata: {
          plan: plan.label,
          user_email: formData.email,
          user_name: formData.name,
        },
      }

      const res = await fetch(`${SYNC_API}/v1/gateway/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pixPayload),
      })

      const responseText = await res.text()

      if (!res.ok) {
        console.log("[v0] PIX response error:", res.status, responseText)
        setFormError("Erro ao gerar pagamento. Tente novamente.")
        setIsLoading(false)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        console.log("[v0] PIX invalid JSON:", responseText)
        setFormError("Erro ao processar resposta. Tente novamente.")
        setIsLoading(false)
        return
      }

      const paymentCode = data.paymentCode || data.payment_code || data.pix_code || data.qr_code || data.data?.paymentCode
      const txId = data.idTransaction || data.id || data.transaction_id || data.data?.idTransaction

      if (!paymentCode) {
        console.log("[v0] PIX response keys:", JSON.stringify(data))
        setFormError("Codigo Pix nao retornado. Tente novamente.")
        setIsLoading(false)
        return
      }

      setPixCode(paymentCode)
      setTransactionId(txId || "")
      setCheckoutStep("pix")

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "AddPaymentInfo")
      }
      sendConversionEvent("AddPaymentInfo")
    } catch (err) {
      console.log("[v0] Checkout error:", err)
      setFormError("Erro de conexao. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback
      const textarea = document.createElement("textarea")
      textarea.value = pixCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const closeCheckout = () => {
    setCheckoutStep("closed")
    setFormError("")
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!transactionId) return
    try {
      const token = await getSyncToken()
      const res = await fetch(`${SYNC_API}/v1/gateway/api/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const status = data.status || data.data?.status || ""
      if (status === "completed" || status === "paid" || status === "approved") {
        setCheckoutStep("success")
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("track", "Purchase", { value: PLANS[selectedPlan]?.amount / 100, currency: "BRL" })
        }
        sendConversionEvent("Purchase")
      }
    } catch {
      // Silent fail, will retry
    }
  }, [transactionId, selectedPlan])

  useEffect(() => {
    if (checkoutStep === "pix" && transactionId) {
      pollingRef.current = setInterval(checkPaymentStatus, 5000)
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }
  }, [checkoutStep, transactionId, checkPaymentStatus])

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView")
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "#F5F0EB" }}>
      {/* Card Container */}
      <div className="max-w-xl mx-auto">
        {/* Cover + Profile */}
        <div className="bg-white rounded-b-2xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="relative w-full h-36 sm:h-44">
            <img
              src="https://i.postimg.cc/XvTzcSDy/Quality-Restoration-Ultra-HD-Design-sem-nome.jpg"
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Stats overlay on cover */}
            <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white text-xs">
              <div className="flex items-center gap-1">
                <Image className="w-3.5 h-3.5" />
                <span>10</span>
              </div>
              <div className="flex items-center gap-1">
                <Film className="w-3.5 h-3.5" />
                <span>15</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>3</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>1.6K</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="relative px-5 pb-5">
            {/* Profile Image - overlapping cover */}
            <div className="-mt-12">
              <img
                src="/images/profile-gemeas-final.jpg"
                alt="Gemeas Scarlatt"
                className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
              />
            </div>

            {/* Name + Badge */}
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>
                  {"G\u00eameas Scarlatt"}
                </h1>
                <svg className="w-4 h-4" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="11" fill="#E8774A" />
                  <path d="M9.5 14.5L6 11l1.4-1.4 2.1 2.1 4.6-4.6L15.5 8.5 9.5 14.5z" fill="white" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">@Gemeasscarlatt</p>
            </div>

            {/* Bio */}
            <div className="mt-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                {"Tati & Tau \u2014 Ruivas de olhos claros, naturais, 21 anos. Id\u00eanticas e meigas a primeira vista. N\u00e3o somos qualquer conte\u00fado. Somos o desejo que voc\u00ea n\u00e3o devia ter. Exclusivo e raro, e.. Seu \u2014 se..."}
              </p>
              <button
                type="button"
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-sm mt-1"
                style={{ color: "#E8774A" }}
              >
                {bioExpanded ? "Ver menos" : "Ler mais"}
              </button>
              {bioExpanded && (
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  {"...voc\u00ea tiver coragem de entrar. Conte\u00fado novo todo dia. Vem conhecer nosso lado +18."}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 mt-4 text-gray-600 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>Brasil</span>
            </div>

            {/* Subscription Section */}
            <div className="mt-6">
              <h3 className="text-gray-900 text-base mb-3" style={{ fontWeight: 600 }}>
                Assinaturas
              </h3>

              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => handlePlanClick("monthly")}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl mb-3 transition-all duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(to right, #F0C8A0, #E8A8A0)" }}
              >
                <span className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>{"1 m\u00eas"}</span>
                <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>R$ 19,90</span>
              </button>
            </div>

            {/* Promotions Section */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowPromos(!showPromos)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-gray-900 text-base" style={{ fontWeight: 600 }}>
                  {"Promo\u00e7\u00f5es"}
                </h3>
                {showPromos ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showPromos && (
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => handlePlanClick("quarterly")}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 hover:opacity-90"
                    style={{ background: "linear-gradient(to right, #F0C8A0, #E8A8A0)" }}
                  >
                    <span className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>{"3 meses (15% off )"}</span>
                    <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>R$ 50,74</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanClick("yearly")}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 hover:opacity-90"
                    style={{ background: "linear-gradient(to right, #F0C8A0, #E8A8A0)" }}
                  >
                    <span className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>{"6 meses (20% off )"}</span>
                    <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>R$ 95,52</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm mt-3 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-colors ${
                activeTab === "posts"
                  ? "border-b-2"
                  : "text-gray-500"
              }`}
              style={activeTab === "posts" ? { color: "#E8774A", borderColor: "#E8774A" } : {}}
            >
              <FileText className="w-4 h-4" />
              <span>27 Postagens</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-colors ${
                activeTab === "media"
                  ? "border-b-2"
                  : "text-gray-500"
              }`}
              style={activeTab === "media" ? { color: "#E8774A", borderColor: "#E8774A" } : {}}
            >
              <LayoutGrid className="w-4 h-4" />
              {"25 M\u00eddias"}
            </button>
          </div>

          {/* Post Preview */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/profile-gemeas-final.jpg"
                alt="Gemeas Scarlatt"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                    {"G\u00eameas Scarlatt"}
                  </span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="11" fill="#E8774A" />
                    <path d="M9.5 14.5L6 11l1.4-1.4 2.1 2.1 4.6-4.6L15.5 8.5 9.5 14.5z" fill="white" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">@Gemeasscarlatt</p>
              </div>
              <button type="button" className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>

            {/* Blurred preview content */}
            <div className="mt-3 rounded-xl overflow-hidden relative">
              <img
                src="https://i.postimg.cc/XvTzcSDy/Quality-Restoration-Ultra-HD-Design-sem-nome.jpg"
                alt="Preview"
                className="w-full h-48 object-cover"
                style={{ filter: "blur(20px)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-3">
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-6" />
      </div>

      {/* Checkout Modal */}
      {checkoutStep !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCheckout} />

          {/* Modal */}
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-gray-900 text-base" style={{ fontWeight: 600 }}>
                {checkoutStep === "form" && "Finalizar assinatura"}
                {checkoutStep === "pix" && "Pagamento via Pix"}
                {checkoutStep === "success" && "Pagamento confirmado"}
              </h2>
              <button type="button" onClick={closeCheckout} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Step */}
            {checkoutStep === "form" && (
              <div className="p-5 space-y-4">
                {/* Plan summary */}
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "linear-gradient(to right, #F0C8A0, #E8A8A0)" }}>
                  <span className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>
                    {PLANS[selectedPlan]?.label}
                  </span>
                  <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                    {PLANS[selectedPlan]?.price}
                  </span>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-600 mb-1">Nome completo *</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8774A] focus:ring-1 focus:ring-[#E8774A] transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-600 mb-1">E-mail *</label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8774A] focus:ring-1 focus:ring-[#E8774A] transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>

                </div>

                {formError && (
                  <p className="text-red-500 text-xs">{formError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitForm}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(to right, #E8774A, #D4633A)" }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando Pix...
                    </>
                  ) : (
                    `Pagar ${PLANS[selectedPlan]?.price}`
                  )}
                </button>

                <p className="text-gray-400 text-xs text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Pagamento seguro e sigiloso
                </p>
              </div>
            )}

            {/* PIX Step */}
            {checkoutStep === "pix" && (
              <div className="p-5 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-gray-700 text-sm">
                    Copie o codigo Pix abaixo e pague pelo app do seu banco.
                  </p>
                  <p className="text-gray-500 text-xs">
                    O acesso sera liberado automaticamente apos a confirmacao.
                  </p>
                </div>

                {/* PIX Code */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-700 text-xs break-all font-mono leading-relaxed">
                    {pixCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-3 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: copied ? "#22c55e" : "linear-gradient(to right, #E8774A, #D4633A)" }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Codigo copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar codigo Pix
                    </>
                  )}
                </button>

                {/* Waiting indicator */}
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Aguardando pagamento...</span>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-xs">
                    {PLANS[selectedPlan]?.label} - {PLANS[selectedPlan]?.price}
                  </p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {checkoutStep === "success" && (
              <div className="p-5 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "#22c55e" }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-900 text-lg" style={{ fontWeight: 600 }}>
                  Pagamento confirmado!
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Seu acesso ao conteudo exclusivo foi liberado. Voce recebera os detalhes no e-mail cadastrado.
                </p>
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-full py-3 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90"
                  style={{ background: "linear-gradient(to right, #E8774A, #D4633A)" }}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
