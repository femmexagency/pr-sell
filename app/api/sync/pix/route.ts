import { NextRequest, NextResponse } from "next/server"

const SYNC_API_BASE = "https://api.sync.com.br"

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000"}/api/sync/auth`, {
    method: "POST",
  })
  const data = await res.json()
  if (!data.access_token) throw new Error("Failed to get auth token")
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, amount, plan } = body

    if (!name || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const token = await getAuthToken()

    // Calculate expiration (30 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    const pixPayload = {
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      pix: {
        expiresInDays: expiresAt.toISOString().split("T")[0],
      },
      items: [
        {
          title: `Assinatura Gemeas Scarlatt - ${plan || "Mensal"}`,
          quantity: 1,
          tangible: false,
          unitPrice: amount,
        },
      ],
      amount: amount,
      customer: {
        cpf: "00000000000",
        name: name,
        email: email,
        phone: "",
        externaRef: `GS-${Date.now()}`,
        address: {
          city: "Sao Paulo",
          state: "SP",
          street: "N/A",
          country: "BR",
          zipCode: "00000-000",
          complement: "",
          neighborhood: "N/A",
          streetNumber: "0",
        },
      },
      metadata: {
        provider: "GemeasScarlatt",
        sell_url: typeof request.headers.get("referer") === "string" ? request.headers.get("referer") : "https://gemeasscarlatt.com",
        order_url: "https://gemeasscarlatt.com",
        user_email: email,
        user_identitication_number: "00000000000",
      },
      traceable: true,
      postbackUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000"}/api/sync/webhook`,
    }

    const response = await fetch(`${SYNC_API_BASE}/v1/gateway/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pixPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] PIX request failed:", response.status, errorText)
      return NextResponse.json({ error: "Payment request failed" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      status: data.status,
      paymentCode: data.paymentCode,
      paymentCodeBase64: data.paymentCodeBase64,
      idTransaction: data.idTransaction,
      statusTransaction: data.status_transaction,
    })
  } catch (error) {
    console.error("[v0] PIX error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
