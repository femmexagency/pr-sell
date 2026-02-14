"use client"

import { useState } from "react"
import { Image, Film, Lock, Heart, MapPin, ChevronUp, ChevronDown, FileText, LayoutGrid } from "lucide-react"

export default function ProfilePage() {
  const [showPromos, setShowPromos] = useState(true)
  const [activeTab, setActiveTab] = useState<"posts" | "media">("posts")
  const [bioExpanded, setBioExpanded] = useState(false)

  const handlePlanClick = (plan: string) => {
    window.open("https://privacy.com.br/checkout/gemeasscarlatt", "_blank")
  }

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

    </div>
  )
}
