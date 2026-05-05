import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin initialize karo (sirf ek baar)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Firebase Admin se user dhundo
    const user = await getAuth().getUserByEmail(email)

    // Verification link generate karo
    const verificationLink = await getAuth().generateEmailVerificationLink(email, {
      url: 'https://hireiq-chi.vercel.app'
    })

    // Resend se professional email bhejo
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
            <p style="color: #374151; font-size: 15px;">
              Thank you for signing up! Please verify your email address to get started.
            </p>
            <a href="${verificationLink}" 
               style="display: inline-block; margin-top: 20px; padding: 14px 28px;
                      background: linear-gradient(135deg, #6C63FF, #00D4AA);
                      color: white; border-radius: 10px; text-decoration: none; 
                      font-weight: bold; font-size: 15px;">
              Verify Email Address
            </a>
            <p style="margin-top: 24px; color: #6B7280; font-size: 13px;">
              If you didn't create a HireIQ account, you can safely ignore this email.
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

  } catch (err) {
    console.error('Verification error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}