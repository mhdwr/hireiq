import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Sparkles, X, AlertCircle } from 'lucide-react'
import axios from 'axios'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default function Dashboard({ onResults }) {
  const [cvFiles, setCvFiles] = useState([])
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [dragging, setDragging] = useState(false)

  const isMobile = window.innerWidth < 768

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    setCvFiles(prev => [...prev, ...valid])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const removeFile = (index) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index))
  }

  const readFileAsText = async (file) => {
    return new Promise((resolve, reject) => {
      const extractText = async () => {
        const arrayBuffer = await file.arrayBuffer()
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map(item => item.str).join(' ') + '\n'
        }
        resolve(fullText)
      }

      if (window.pdfjsLib) {
        extractText()
      } else {
        const s = document.createElement('script')
        s.id = 'pdfjs-script'
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'
        s.onload = extractText
        s.onerror = reject
        document.head.appendChild(s)
      }
    })
  }

  const readWordAsText = async (file) => {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  const screenCVs = async () => {
    // Clear previous errors
    setError('')

    // Validate inputs
    if (cvFiles.length === 0) {
      setError('Please upload at least one CV before screening.')
      return
    }

    if (!jobDesc.trim()) {
      setError('Please enter a job description before screening.')
      return
    }

    if (jobDesc.trim().length < 50) {
      setError('Job description is too short. Please add more detail.')
      return
    }

    setLoading(true)
    setProgress({ current: 0, total: cvFiles.length })

    const results = []
    const failed = []

    for (let i = 0; i < cvFiles.length; i++) {
      const file = cvFiles[i]

      // Update progress for each file
      setProgress({ current: i + 1, total: cvFiles.length })

      // Check file size — max 5MB
      if (file.size > 5 * 1024 * 1024) {
        failed.push({ name: file.name, reason: 'File too large. Maximum size is 5MB.' })
        continue
      }

      try {
        // Extract text based on file type
        let cvText = ''
        if (file.type === 'application/pdf') {
          cvText = await readFileAsText(file)
        } else {
          cvText = await readWordAsText(file)
        }

        // Check if file had readable content
        if (!cvText || cvText.trim().length < 50) {
          failed.push({ name: file.name, reason: 'Could not read file. It may be empty or scanned image.' })
          continue
        }

        // Send to backend API
        const response = await axios.post('/api/screen', {
          cvText,
          jobDesc: jobDesc.trim()
        })

        results.push({ ...response.data, fileName: file.name })
        await delay(2000)

      } catch (err) {
        if (err.response) {
          const status = err.response.status
          const message = err.response.data?.error || 'Unknown error'

          // Rate limit hit — stop processing all files
          if (status === 429) {
            setError('Too many requests. Please wait an hour and try again.')
            setLoading(false)
            return
          }

          if (status === 504) {
            failed.push({ name: file.name, reason: 'Request timed out. Please retry.' })
          } else if (status === 502) {
            failed.push({ name: file.name, reason: 'AI service error. Please retry.' })
          } else {
            failed.push({ name: file.name, reason: message })
          }

        } else if (err.request) {
          // Request was made but no response received
          failed.push({ name: file.name, reason: 'Network error. Check your internet connection.' })
        } else {
          failed.push({ name: file.name, reason: 'Unexpected error. Please retry.' })
        }
      }
    }

    setLoading(false)

    // If no CV was successfully processed
    if (results.length === 0) {
      setError('No CVs could be processed. Please check your files and try again.')
      return
    }

    // Sort by match score and send results
    results.sort((a, b) => b.matchScore - a.matchScore)
    onResults({ results, failed, jobDesc })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: isMobile ? '20px' : '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '900px', margin: '0 auto 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '22px' }}>HireIQ</span>
        </div>
        <h1 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: 800, fontFamily: 'Syne' }}>
          CV Screening Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: isMobile ? '14px' : '16px' }}>
          Upload CVs and paste job description to get AI-powered shortlist
        </p>
      </motion.div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '24px' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: isMobile ? '32px 20px' : '48px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(108,99,255,0.05)' : 'var(--card)',
              transition: 'all 0.3s ease'
            }}>
            <Upload size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: isMobile ? '16px' : '20px', marginBottom: '8px' }}>
              {isMobile ? 'Tap to upload CVs' : 'Drop CVs here or click to upload'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Supports PDF & Word files — upload multiple at once
            </p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <AnimatePresence>
            {cvFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cvFiles.map((file, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--card)', borderRadius: '12px',
                      padding: '12px 16px', border: '1px solid var(--border)'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileText size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: '14px', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <X size={16} color="var(--muted)" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <label style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px', display: 'block', marginBottom: '12px' }}>
            Job Description
          </label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste your full job description here — required skills, experience, responsibilities..."
            rows={isMobile ? 6 : 8}
            style={{
              width: '100%', padding: '20px',
              borderRadius: '16px', border: '1px solid var(--border)',
              background: 'var(--card)', fontFamily: 'DM Sans',
              fontSize: '15px', color: 'var(--text)',
              resize: 'vertical', outline: 'none',
              transition: 'border 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.border = '1px solid var(--accent)'}
            onBlur={(e) => e.target.style.border = '1px solid var(--border)'}
          />
        </motion.div>

        {/* Progress bar — shows while screening is in progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '16px',
              background: 'rgba(108,99,255,0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(108,99,255,0.3)'
            }}>
            <p style={{ marginBottom: '10px', fontWeight: 500, fontSize: '14px' }}>
              Screening CV {progress.current} of {progress.total}...
            </p>
            <div style={{
              height: '8px',
              background: 'var(--border)',
              borderRadius: '99px',
              overflow: 'hidden'
            }}>
              <motion.div
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  borderRadius: '99px'
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: '12px', padding: '14px 18px', color: '#FF5050'
            }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '14px' }}>{error}</span>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(108,99,255,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={screenCVs}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'var(--muted)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: 'white', border: 'none', borderRadius: '16px',
            padding: isMobile ? '16px' : '20px',
            fontSize: isMobile ? '16px' : '18px',
            fontFamily: 'Syne', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
            transition: 'all 0.3s ease'
          }}>
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '20px', height: '20px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }} />
              Screening CV {progress.current} of {progress.total}...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Screen {cvFiles.length > 0 ? `${cvFiles.length} CV${cvFiles.length > 1 ? 's' : ''}` : 'CVs'} with AI
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}