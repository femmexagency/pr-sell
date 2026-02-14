"use server"

const SYNC_API = "https://api.sync.com.br"
const CLIENT_ID = "89210cff-1a37-4cd0-825d-45fecd8e77bb"
const CLIENT_SECRET = "dadc1b2c-86ee-4256-845a-d1511de315bb"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const res = await fetch(`${SYNC_API}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  const text = await res.text()
  console.log("[v0] Auth status:", res.status, "body:", text.substring(0, 200))

  if (!res.ok) {
    return ""
  }

  try {
    const data = JSON.parse(text)
    const token = data.access_token || data.token || data.data?.access_token
    if (token) {
      cachedToken = {
        token,
        expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 3600000,
      }
      return token
    }
  } catch {
    // parse error
  }
  return ""
}

export async function createPixPayment(input: {
  name: string
  email: string
  amount: number
  planLabel: string
}): Promise<{ success: boolean; paymentCode?: string; transactionId?: string; error?: string }> {
  try {
    const token = await getToken()
    if (!token) {
      return { success: false, error: "Falha na autenticacao. Tente novamente." }
    }

    const pixPayload = {
      amount: input.amount,
      paymentMethod: "PIX",
      customer: {
        cpf: "00000000000",
        name: input.name,
        email: input.email,
        phone: "",
      },
      pix: {
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      items: [
        {
          title: `Assinatura ${input.planLabel} - Gemeas Scarlatt`,
          unitPrice: input.amount,
          quantity: 1,
          tangible: false,
        },
      ],
      metadata: {
        plan: input.planLabel,
        user_email: input.email,
        user_name: input.name,
      },
    }

    console.log("[v0] Sending PIX request, amount:", input.amount)

    const res = await fetch(`${SYNC_API}/v1/gateway/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pixPayload),
    })

    const text = await res.text()
    console.log("[v0] PIX response status:", res.status, "body:", text.substring(0, 500))

    if (!res.ok) {
      return { success: false, error: "Erro ao gerar pagamento. Tente novamente." }
    }

    const data = JSON.parse(text)
    const paymentCode = data.paymentCode || data.payment_code || data.pix_code || data.qr_code || data.data?.paymentCode
    const txId = data.idTransaction || data.id || data.transaction_id || data.data?.idTransaction

    if (!paymentCode) {
      console.log("[v0] PIX response full:", JSON.stringify(data))
      return { success: false, error: "Codigo Pix nao retornado. Tente novamente." }
    }

    return { success: true, paymentCode, transactionId: txId || "" }
  } catch (err) {
    console.log("[v0] PIX error:", err)
    return { success: false, error: "Erro de conexao. Tente novamente." }
  }
}

export async function checkPixStatus(transactionId: string): Promise<{ status: string }> {
  try {
    const token = await getToken()
    if (!token) return { status: "pending" }

    const res = await fetch(`${SYNC_API}/v1/gateway/api/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return { status: "pending" }

    const data = await res.json()
    return { status: data.status || data.data?.status || "pending" }
  } catch {
    return { status: "pending" }
  }
}
