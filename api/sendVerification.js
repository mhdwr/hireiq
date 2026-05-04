export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, verificationLink } = req.body

  if (!email || !verificationLink) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'HireIQ <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your HireIQ account',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
          <h2 style="color: #6C63FF;">Welcome to HireIQ 👋</h2>
          <p>Click below to verify your email address:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; margin-top: 16px; padding: 14px 28px;
                    background: linear-gradient(135deg, #6C63FF, #00D4AA);
                    color: white; border-radius: 10px; text-decoration: none; font-weight: bold;">
            Verify Email
          </a>
          <p style="margin-top: 24px; color: #6B7280; font-size: 13px;">
            If you didn't create a HireIQ account, ignore this email.
          </p>
        </div>
      `
    })
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(500).json({ error: data.message || 'Email send failed' })
  }

  return res.status(200).json({ success: true })
}