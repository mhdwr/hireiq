// Store request counts per IP address for rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const maxRequestsPerHour = 50;

  // First time this IP is making a request
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + oneHour });
    return true;
  }

  const record = rateLimitMap.get(ip);

  // Reset count if the 1 hour window has passed
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + oneHour });
    return true;
  }

  // Block if request limit exceeded
  if (record.count >= maxRequestsPerHour) return false;

  record.count++;
  return true;
}

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  // Check rate limit for this IP address
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait an hour before trying again.'
    });
  }

  const { cvText, jobDesc } = req.body;

  // Make sure both fields are provided
  if (!cvText || !jobDesc) {
    return res.status(400).json({
      error: 'Both CV text and Job Description are required.'
    });
  }

  // Reject CVs that are too large to process
  if (cvText.length > 15000) {
    return res.status(400).json({
      error: 'CV is too large. Please upload a smaller file (max 5MB).'
    });
  }

  // Reject job descriptions that are too short to be useful
  if (jobDesc.length < 50) {
    return res.status(400).json({
      error: 'Job description is too short. Please add more detail.'
    });
  }

  try {
    // Set a 30 second timeout so the request does not hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR recruiter. Analyze the CV against the job description and respond ONLY in this exact JSON format with no extra text:
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
    });

    clearTimeout(timeout);

    // Handle errors returned by the Groq API
    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      console.error('Groq API returned an error:', errorData);
      return res.status(502).json({
        error: 'AI service is temporarily unavailable. Please try again.'
      });
    }

    const data = await groqResponse.json();

    // Make sure the AI actually returned a message
    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(502).json({
        error: 'AI returned an empty response. Please try again.'
      });
    }

    const content = data.choices[0].message.content;

    // Try to parse the AI response as JSON
    let parsed;
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return res.status(502).json({
        error: 'AI response could not be read. Please try again.'
      });
    }

    // Make sure all required fields are present in the response
    if (
      typeof parsed.matchScore !== 'number' ||
      !Array.isArray(parsed.matchedSkills) ||
      !Array.isArray(parsed.missingSkills)
    ) {
      return res.status(502).json({
        error: 'AI returned incomplete data. Please try again.'
      });
    }

    // Everything is good, send the result back
    return res.status(200).json(parsed);

  } catch (err) {

    // Handle request timeout separately
    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timed out. The AI is taking too long. Please try again.'
      });
    }

    // Handle any other unexpected errors
    console.error('Unexpected server error:', err);
    return res.status(500).json({
      error: 'Something went wrong on our end. Please try again later.'
    });
  }
}