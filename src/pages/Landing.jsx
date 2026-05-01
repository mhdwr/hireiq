import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, ChevronRight } from 'lucide-react'

export default function Landing({ onStart }) {
  const isMobile = window.innerWidth < 768

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: isMobile ? '16px 20px' : '24px 60px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(248,247,255,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          style={{
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: '12px',
            padding: isMobile ? '10px 18px' : '12px 28px',
            fontFamily: 'Syne',
            fontWeight: 700, fontSize: isMobile ? '13px' : '15px', cursor: 'pointer'
          }}>
          Get Started
        </motion.button>
      </motion.nav>

      {/* Hero */}
      <div style={{
        maxWidth: '900px', margin: '0 auto',
        padding: isMobile ? '60px 20px' : '100px 40px',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '100px', padding: '8px 20px',
            marginBottom: '32px'
          }}>
          <Zap size={14} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
            AI-Powered CV Screening
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          style={{
            fontSize: isMobile ? '38px' : '72px',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '24px'
          }}>
          Hire Smarter,{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Not Harder
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            fontSize: isMobile ? '16px' : '20px',
            color: 'var(--muted)',
            lineHeight: 1.7, marginBottom: '48px',
            maxWidth: '600px', margin: '0 auto 48px'
          }}>
          Upload hundreds of CVs, paste your job description, and let AI rank
          the best candidates in seconds — not days.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(108,99,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: 'white', border: 'none', borderRadius: '16px',
            padding: isMobile ? '14px 32px' : '18px 48px',
            fontSize: isMobile ? '16px' : '18px',
            fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '10px'
          }}>
          Start Screening <ChevronRight size={20} />
        </motion.button>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          style={{
            display: 'flex', justifyContent: 'center',
            gap: isMobile ? '24px' : '60px', marginTop: '80px',
            flexWrap: 'wrap'
          }}>
          {[
            { num: '10x', label: 'Faster Screening' },
            { num: '95%', label: 'Accuracy Rate' },
            { num: '500+', label: 'CVs at Once' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: isMobile ? '28px' : '40px',
                fontWeight: 800,
                fontFamily: 'Syne',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{stat.num}</div>
              <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px', marginTop: '80px'
          }}>
          {[
            { icon: <Zap size={24} color="var(--accent)" />, title: 'Instant Analysis', desc: 'AI screens every CV in milliseconds with deep understanding' },
            { icon: <Target size={24} color="var(--accent2)" />, title: 'Smart Matching', desc: 'Matches skills, experience and keywords to your job description' },
            { icon: <Sparkles size={24} color="var(--accent)" />, title: 'Ranked Results', desc: 'Get a scored shortlist — best candidates at the top always' },
          ].map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
              style={{
                background: 'var(--card)', borderRadius: '20px',
                padding: '32px', border: '1px solid var(--border)',
                textAlign: 'left', cursor: 'default'
              }}>
              <div style={{ marginBottom: '16px' }}>{card.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{card.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}