export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cvText, jobDesc } = req.body

  if (!cvText || !jobDesc) {
    return res.status(400).json({ error: 'Missing cvText or jobDesc' })
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruiter. Analyze the CV against the job description and respond ONLY in this exact JSON format:
{
  "name": "candidate full name or Unknown",
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "summary": "2 sentence summary of candidate fit"
}`
          },
          {
            role: 'user',
            content: `JOB DESCRIPTION:\n${jobDesc}\n\nCV CONTENT:\n${cvText.slice(0, 3000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    const data = await groqResponse.json()
    console.log('Groq status:', groqResponse.status)
    console.log('Groq response:', JSON.stringify(data))

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'Groq API failed', details: data })
    }

    const content = data.choices[0].message.content
    const clean = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}