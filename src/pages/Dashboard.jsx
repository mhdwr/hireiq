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
  const [dragging, setDragging] = useState(false)

  const isMobile = window.innerWidth < 768

  const handleFiles = (files) => {
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf')
    setCvFiles(prev => [...prev, ...pdfs])
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

  const screenCVs = async () => {
    if (cvFiles.length === 0 || !jobDesc.trim()) {
      setError('Please upload CVs and enter a job description!')
      return
    }
    setError('')
    setLoading(true)

    try {
      const results = []

      for (const file of cvFiles) {
        const cvText = await readFileAsText(file)
        const response = await axios.post('/api/screen', { cvText, jobDesc })
        const parsed = response.data
        results.push({ ...parsed, fileName: file.name })
        await delay(2000)
      }

      results.sort((a, b) => b.matchScore - a.matchScore)
      onResults(results)

    } catch (err) {
      setError('Something went wrong. Check your API key or try again!')
      console.error(err)
    }

    setLoading(false)
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
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Supports PDF files — upload multiple at once</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf"
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
              Screening CVs...
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