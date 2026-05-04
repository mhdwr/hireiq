import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Sparkles, CheckCircle, XCircle, Trophy, Filter, AlertTriangle } from 'lucide-react'

export default function Results({ data, onBack }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('score')

  // Support both old format (results array) and new format ({ results, failed, jobDesc })
  const results = data?.results ?? (Array.isArray(data) ? data : [])
  const failed = data?.failed ?? []

  const isMobile = window.innerWidth < 768

  const filtered = results
    .filter(r => {
      if (filter === 'top') return r.matchScore >= 70
      if (filter === 'mid') return r.matchScore >= 40 && r.matchScore < 70
      if (filter === 'low') return r.matchScore < 40
      return true
    })
    .sort((a, b) => sortBy === 'score' ? b.matchScore - a.matchScore : a.name.localeCompare(b.name))

  const downloadCSV = () => {
    const headers = ['Name', 'Match Score', 'Matched Skills', 'Missing Skills', 'Summary', 'File']
    const rows = results.map(r => [
      r.name,
      `${r.matchScore}%`,
      r.matchedSkills.join(' | '),
      r.missingSkills.join(' | '),
      r.summary,
      r.fileName
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'HireIQ_Shortlist.csv'
    a.click()
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#00D4AA'
    if (score >= 40) return '#F59E0B'
    return '#FF5050'
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Strong Match'
    if (score >= 40) return 'Partial Match'
    return 'Weak Match'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: isMobile ? '20px' : '40px' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1000px', margin: '0 auto 32px' }}>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px',
          flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              style={{
                background: 'var(--card)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '12px',
                padding: isMobile ? '10px 14px' : '12px 24px',
                fontFamily: 'Syne',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              <ArrowLeft size={16} /> {!isMobile && 'Back'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(108,99,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCSV}
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: isMobile ? '10px 14px' : '12px 24px',
                fontFamily: 'Syne',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              <Download size={16} /> {!isMobile && 'Download CSV'}
            </motion.button>
          </div>
        </div>

        <h1 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: 800, fontFamily: 'Syne', marginBottom: '8px' }}>
          Screening Results
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: isMobile ? '14px' : '16px' }}>
          {results.length} CVs screened — top candidates ranked by AI match score
        </p>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px', marginTop: '24px'
        }}>
          {[
            { label: 'Total Screened', value: results.length, color: 'var(--accent)' },
            { label: 'Strong Matches', value: results.filter(r => r.matchScore >= 70).length, color: '#00D4AA' },
            { label: 'Partial Matches', value: results.filter(r => r.matchScore >= 40 && r.matchScore < 70).length, color: '#F59E0B' },
            { label: 'Weak Matches', value: results.filter(r => r.matchScore < 40).length, color: '#FF5050' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--card)', borderRadius: '16px',
              padding: isMobile ? '16px' : '20px 24px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, fontFamily: 'Syne', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Failed Files Warning — shows only if some CVs failed */}
      {failed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '1000px', margin: '0 auto 24px',
            padding: '16px 20px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '16px'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={16} color="#F59E0B" />
            <span style={{ fontWeight: 700, fontFamily: 'Syne', fontSize: '14px', color: '#F59E0B' }}>
              {failed.length} file{failed.length > 1 ? 's' : ''} could not be processed
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {failed.map((f, i) => (
              <p key={i} style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                <strong style={{ color: 'var(--text)' }}>{f.name}</strong> — {f.reason}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          maxWidth: '1000px', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
        }}>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'top', label: '🟢 Strong' },
            { key: 'mid', label: '🟡 Partial' },
            { key: 'low', label: '🔴 Weak' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 14px', borderRadius: '100px',
                border: '1px solid var(--border)',
                background: filter === f.key ? 'var(--accent)' : 'var(--card)',
                color: filter === f.key ? 'white' : 'var(--text)',
                fontFamily: 'DM Sans', fontWeight: 500,
                fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--muted)" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--card)', fontFamily: 'DM Sans',
              fontSize: '13px', cursor: 'pointer', outline: 'none'
            }}>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </motion.div>

      {/* Candidate Cards */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {filtered.map((candidate, i) => (
            <motion.div
              key={candidate.fileName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              style={{
                background: 'var(--card)', borderRadius: '20px',
                padding: isMobile ? '20px' : '28px',
                border: '1px solid var(--border)',
                transition: 'box-shadow 0.3s ease'
              }}>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '16px',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  {i === 0 && <Trophy size={20} color="#F59E0B" style={{ flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'Syne', fontWeight: 700,
                      fontSize: isMobile ? '16px' : '20px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{candidate.name}</h3>
                    <p style={{
                      color: 'var(--muted)', fontSize: '12px', marginTop: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{candidate.fileName}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: isMobile ? '24px' : '32px',
                    fontWeight: 800, fontFamily: 'Syne',
                    color: getScoreColor(candidate.matchScore)
                  }}>
                    {candidate.matchScore}%
                  </div>
                  <div style={{
                    fontSize: '11px', fontWeight: 600,
                    color: getScoreColor(candidate.matchScore),
                    background: `${getScoreColor(candidate.matchScore)}18`,
                    padding: '4px 10px', borderRadius: '100px',
                    marginTop: '4px'
                  }}>
                    {getScoreLabel(candidate.matchScore)}
                  </div>
                </div>
              </div>

              {/* Score Bar */}
              <div style={{
                height: '6px', background: 'var(--border)',
                borderRadius: '100px', marginBottom: '20px', overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.matchScore}%` }}
                  transition={{ delay: i * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${getScoreColor(candidate.matchScore)}, var(--accent))`,
                    borderRadius: '100px'
                  }}
                />
              </div>

              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                {candidate.summary}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <CheckCircle size={14} color="#00D4AA" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#00D4AA' }}>Matched Skills</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {candidate.matchedSkills.map(skill => (
                      <span key={skill} style={{
                        background: 'rgba(0,212,170,0.1)', color: '#00A884',
                        padding: '4px 12px', borderRadius: '100px',
                        fontSize: '12px', fontWeight: 500,
                        border: '1px solid rgba(0,212,170,0.2)'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <XCircle size={14} color="#FF5050" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF5050' }}>Missing Skills</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {candidate.missingSkills.map(skill => (
                      <span key={skill} style={{
                        background: 'rgba(255,80,80,0.1)', color: '#FF5050',
                        padding: '4px 12px', borderRadius: '100px',
                        fontSize: '12px', fontWeight: 500,
                        border: '1px solid rgba(255,80,80,0.2)'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}