"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Eye } from "lucide-react"

export default function PresellPage() {
  const [userCount, setUserCount] = useState(1247)
  const [viewCount, setViewCount] = useState(3891)

  const FB_ACCESS_TOKEN =
    "EAAJ6bVYk96kBPtG7OmkBoNHaw6HN1EB5BlLeFp51NAskuyxWFIV86Qqho64mwlfcNYVH6fWHRPZBL6boFtY5TTTZA3H15y3GIxZCEuvC8wBtZCyi6hvWVwPPjZA9rXlLFqr97VbCPZCfXzmF8xKzrVk7ncXm0U111ZCvYziOaU7yFWyp0TZB2ebNgKQZCMA9zWQZDZD"
  const PIXEL_ID = "2057231185018157"

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3))
      setViewCount((prev) => prev + Math.floor(Math.random() * 5))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const sendConversionEvent = async (eventName: string, eventSourceUrl: string) => {
    try {
      const eventData = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: eventSourceUrl,
            action_source: "website",
            user_data: {
              client_ip_address: "{{client_ip_address}}",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error("Error sending conversion event:", error)
    }
  }

  const handleTelegramClick = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead")
    }
    sendConversionEvent("Lead", window.location.href)
  }

  const handlePrivacyClick = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "ViewContent")
    }
    sendConversionEvent("ViewContent", window.location.href)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(https://i.postimg.cc/XvTzcSDy/Quality-Restoration-Ultra-HD-Design-sem-nome.jpg)",
          filter: "blur(2px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            {/* Profile Image */}
            <div className="relative">
              <img
                src="/images/profile-gemeas-final.jpg"
                alt="Gêmeas Scarlatt"
                className="w-24 h-24 rounded-full mx-auto border-4 border-white object-cover shadow-lg"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white text-balance">
                VEM CONHECER NOSSO LADO{" "}
                <span className="text-red-400 font-bold inline-flex items-center gap-1">
                  <img src="https://img.icons8.com/color/24/000000/18-plus.png" alt="+18" className="w-6 h-6" />
                </span>
              </h1>
              <p className="text-gray-300 font-bold text-sm">Chame para conteudos completos</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm font-bold">{userCount.toLocaleString()} Assinantes</span>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-white" />
                <span className="text-sm font-bold">{viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            {/* Telegram Button */}
            <Button
              asChild
              className="w-full bg-[#0088cc] hover:bg-[#006699] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-white/20 backdrop-blur-sm min-h-[60px]"
              onClick={handleTelegramClick}
            >
              <a href="https://t.me/asgemeasvip" target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <span className="text-center w-full">TELEGRAM +18</span>
                </div>
              </a>
            </Button>
          </div>
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
