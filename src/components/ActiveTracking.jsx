import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import BusinessIcon from '@mui/icons-material/Business'
import InsightsIcon from '@mui/icons-material/Insights'
import GroupIcon from '@mui/icons-material/Group'
import AssignmentIcon from '@mui/icons-material/Assignment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TableChartIcon from '@mui/icons-material/TableChart'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useDatabase } from '../hooks/useDatabase'
import './ActiveTracking.css'

const API_BASE = 'http://65.1.6.81:3001'

// Selectable limits for the per-employee chart so labels stay readable
const EMPLOYEE_LIMIT_OPTIONS = [10, 15, 25, 50]

// Brand chart palette (purple-based)
const CHART_COLORS = ['#895BF5', '#A68AF9', '#BF83FC', '#7D89F7', '#727279']
const BAND_COLORS = {
  Excellent: '#895BF5',
  Good: '#A68AF9',
  'Needs Improvement': '#BF83FC'
}

const scoreBand = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  return 'Needs Improvement'
}

// Best-available timestamp for an attempt
const attemptTime = (a) => new Date(a.completed_at || a.created_at || a.started_at || 0).getTime()

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

// Escape a value for CSV
const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Brand palette as RGB tuples for jsPDF (which doesn't take hex strings directly)
const PDF_BRAND = [137, 91, 245]   // #895BF5
const PDF_INK = [24, 24, 27]       // near-black body text
const PDF_MUTED = [114, 114, 121]  // secondary text
const PDF_FAINT = [161, 161, 170]  // footer / captions
const PDF_HAIRLINE = [228, 228, 231]

// Preload an image so it can be drawn into the PDF; resolves null on failure
// (logo is optional — a missing asset shouldn't break the export).
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

const ActiveTracking = () => {
  const { allQuizAttempts, loadAllQuizAttempts, quizzes } = useDatabase()

  const [userMap, setUserMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrg, setSelectedOrg] = useState('')
  const [employeeLimit, setEmployeeLimit] = useState('15') // number string or 'all'
  const [dateRange, setDateRange] = useState('all') // all | 30d | quarter | custom
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedBand, setSelectedBand] = useState(null)
  const [exporting, setExporting] = useState(false)
  // View mode: 'internal' shows real employee names (internal team monitoring),
  // 'company' anonymizes identities so companies see performance without names.
  const [viewMode, setViewMode] = useState('internal') // 'internal' | 'company'

  const dashboardRef = useRef(null)

  // Load attempts + the users they reference (the list endpoint isn't available,
  // and the global attempts endpoint returns flat records, so enrich client-side).
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const attempts = await loadAllQuizAttempts()
        const userIds = [...new Set((attempts || []).map(a => a.user_id).filter(Boolean))]
        const entries = await Promise.all(
          userIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE}/api/users/${id}`)
              if (res.ok) return [id, await res.json()]
            } catch (e) { /* ignore */ }
            return [id, null]
          })
        )
        setUserMap(Object.fromEntries(entries))
      } catch (err) {
        console.error('Active Tracking load error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [loadAllQuizAttempts])

  // Enrich each attempt with quiz name, employee name and organization
  const attempts = useMemo(() => {
    return (allQuizAttempts || []).map(a => {
      const quiz = (quizzes || []).find(q => String(q.id) === String(a.quiz_id))
      const u = userMap[a.user_id] || null
      return {
        ...a,
        score: Number(a.score) || 0,
        quizName: quiz?.name || 'Unknown Quiz',
        employee: u?.user_name || u?.email || `User ${a.user_id || '?'}`,
        organization: (u?.organization && u.organization.trim()) || 'Unspecified'
      }
    })
  }, [allQuizAttempts, quizzes, userMap])

  // Organizations available in the data
  const organizations = useMemo(() => {
    return [...new Set(attempts.map(a => a.organization))].sort((a, b) => a.localeCompare(b))
  }, [attempts])

  // Default selection to the first organization once data is loaded
  useEffect(() => {
    if (!selectedOrg && organizations.length > 0) {
      setSelectedOrg(organizations[0])
    }
  }, [organizations, selectedOrg])

  const orgAttempts = useMemo(
    () => attempts.filter(a => a.organization === selectedOrg),
    [attempts, selectedOrg]
  )

  const anonymized = viewMode === 'company'

  // Switch view mode and clear drill-downs (a stored name won't match the
  // other mode's labels, so the modal would render empty otherwise).
  const switchViewMode = (mode) => {
    if (mode === viewMode) return
    setSelectedEmployee(null)
    setSelectedBand(null)
    setViewMode(mode)
  }

  // ── Date-range bounds ─────────────────────────────────────
  const rangeBounds = useMemo(() => {
    const now = new Date()
    if (dateRange === '30d') {
      const from = new Date(now); from.setDate(now.getDate() - 30)
      return { from: from.getTime(), to: now.getTime() }
    }
    if (dateRange === 'quarter') {
      const q = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), q * 3, 1)
      return { from: from.getTime(), to: now.getTime() }
    }
    if (dateRange === 'custom') {
      return {
        from: customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : null,
        to: customTo ? new Date(`${customTo}T23:59:59`).getTime() : null
      }
    }
    return { from: null, to: null } // all time
  }, [dateRange, customFrom, customTo])

  // Org attempts filtered by the active period (real employee names)
  const periodAttempts = useMemo(() => {
    const { from, to } = rangeBounds
    if (from == null && to == null) return orgAttempts
    return orgAttempts.filter(a => {
      const t = attemptTime(a)
      if (from != null && t < from) return false
      if (to != null && t > to) return false
      return true
    })
  }, [orgAttempts, rangeBounds])

  // Sequential anonymous labels for Company view, numbered by performance rank
  // (highest average = User 1) so the per-employee chart reads User 1, User 2,
  // User 3 … top-to-bottom. Recomputed per period so numbering stays sequential.
  const anonMap = useMemo(() => {
    const agg = {}
    periodAttempts.forEach(a => {
      if (!agg[a.employee]) agg[a.employee] = { total: 0, count: 0 }
      agg[a.employee].total += a.score
      agg[a.employee].count += 1
    })
    const ranked = Object.entries(agg)
      .map(([name, v]) => ({ name, avg: Math.round(v.total / v.count) }))
      .sort((a, b) => b.avg - a.avg)
    const map = {}
    ranked.forEach((e, i) => { map[e.name] = `User ${i + 1}` })
    return map
  }, [periodAttempts])

  // In Company view the employee field is replaced with its anonymous label so
  // every chart, table, modal and export inherits the anonymization automatically.
  const viewAttempts = useMemo(() => {
    return anonymized
      ? periodAttempts.map(a => ({ ...a, employee: anonMap[a.employee] || 'User' }))
      : periodAttempts
  }, [periodAttempts, anonymized, anonMap])

  // ── Derived chart datasets ────────────────────────────────
  const employeeScores = useMemo(() => {
    const map = {}
    viewAttempts.forEach(a => {
      if (!map[a.employee]) map[a.employee] = { name: a.employee, total: 0, count: 0 }
      map[a.employee].total += a.score
      map[a.employee].count += 1
    })
    return Object.values(map)
      .map(e => ({ name: e.name, avgScore: Math.round(e.total / e.count), attempts: e.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [viewAttempts])

  // Employees to plot, based on the selected limit
  const shownEmployees = useMemo(
    () => (employeeLimit === 'all' ? employeeScores : employeeScores.slice(0, Number(employeeLimit))),
    [employeeScores, employeeLimit]
  )

  const performanceDistribution = useMemo(() => {
    const counts = { Excellent: 0, Good: 0, 'Needs Improvement': 0 }
    viewAttempts.forEach(a => { counts[scoreBand(a.score)] += 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
  }, [viewAttempts])

  const scoreTrend = useMemo(() => {
    const byDate = {}
    viewAttempts
      .filter(a => a.completed_at)
      .forEach(a => {
        const d = new Date(a.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (!byDate[d]) byDate[d] = { date: d, total: 0, count: 0, ts: new Date(a.completed_at).getTime() }
        byDate[d].total += a.score
        byDate[d].count += 1
      })
    return Object.values(byDate)
      .sort((a, b) => a.ts - b.ts)
      .map(d => ({ date: d.date, avgScore: Math.round(d.total / d.count) }))
  }, [viewAttempts])

  const quizAverages = useMemo(() => {
    const map = {}
    viewAttempts.forEach(a => {
      if (!map[a.quizName]) map[a.quizName] = { name: a.quizName, total: 0, count: 0 }
      map[a.quizName].total += a.score
      map[a.quizName].count += 1
    })
    return Object.values(map)
      .map(q => ({ name: q.name, avgScore: Math.round(q.total / q.count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [viewAttempts])

  // Average performance (%) per assessment area across all attempts
  const packetAverages = useMemo(() => {
    const map = {}
    viewAttempts.forEach(a => {
      const pm = a.packet_marks || {}
      Object.entries(pm).forEach(([name, data]) => {
        const total = Number(data?.total) || 0
        const marks = Number(data?.marks) || 0
        if (total <= 0) return
        const pct = (marks / total) * 100
        if (!map[name]) map[name] = { name, total: 0, count: 0 }
        map[name].total += pct
        map[name].count += 1
      })
    })
    return Object.values(map)
      .map(p => ({ name: p.name, avgScore: Math.round(p.total / p.count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [viewAttempts])

  // Top areas for the radar view — too many spokes makes a radar unreadable,
  // so cap at the highest-scoring areas while keeping the full set in the bar chart.
  const RADAR_MAX_AREAS = 10
  const packetRadar = useMemo(
    () => packetAverages.slice(0, RADAR_MAX_AREAS),
    [packetAverages]
  )

  // ── Summary metrics ───────────────────────────────────────
  const summary = useMemo(() => {
    const employees = new Set(viewAttempts.map(a => a.employee)).size
    const totalAttempts = viewAttempts.length
    const avgScore = totalAttempts
      ? Math.round(viewAttempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
      : 0
    const top = employeeScores[0]
    return { employees, totalAttempts, avgScore, top }
  }, [viewAttempts, employeeScores])

  // ── Employee drill-down data ──────────────────────────────
  const employeeDetail = useMemo(() => {
    if (!selectedEmployee) return null
    const rows = viewAttempts
      .filter(a => a.employee === selectedEmployee)
      .sort((a, b) => attemptTime(b) - attemptTime(a))
    if (rows.length === 0) return null

    const scores = rows.map(r => r.score)
    const avg = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)

    const pmap = {}
    rows.forEach(a => {
      const pm = a.packet_marks || {}
      Object.entries(pm).forEach(([name, data]) => {
        const total = Number(data?.total) || 0
        const marks = Number(data?.marks) || 0
        if (total <= 0) return
        const pct = (marks / total) * 100
        if (!pmap[name]) pmap[name] = { packet: name, total: 0, count: 0 }
        pmap[name].total += pct
        pmap[name].count += 1
      })
    })
    const packets = Object.values(pmap)
      .map(p => ({ packet: p.packet, score: Math.round(p.total / p.count) }))
      .sort((a, b) => b.score - a.score)

    return {
      name: selectedEmployee,
      rows,
      attempts: rows.length,
      avg,
      best: Math.max(...scores),
      worst: Math.min(...scores),
      packets
    }
  }, [selectedEmployee, viewAttempts])

  // ── Band drill-down (click a pie slice) ───────────────────
  // Group employees into the clicked performance band by their average score,
  // sorted high→low so "Excellent" leads with the top scorer.
  const bandEmployees = useMemo(() => {
    if (!selectedBand) return null
    return employeeScores.filter(e => scoreBand(e.avgScore) === selectedBand)
  }, [selectedBand, employeeScores])

  // ── Exports ───────────────────────────────────────────────
  const periodLabel = useMemo(() => {
    if (dateRange === '30d') return 'Last 30 days'
    if (dateRange === 'quarter') return 'This quarter'
    if (dateRange === 'custom') return `${customFrom || '…'} to ${customTo || '…'}`
    return 'All time'
  }, [dateRange, customFrom, customTo])

  const fileStamp = () => new Date().toISOString().split('T')[0]

  const exportCSV = () => {
    const headers = ['Organization', 'Employee', 'Quiz', 'Score (%)', 'Status', 'Completed At']
    const rows = viewAttempts.map(a => [
      selectedOrg, a.employee, a.quizName, a.score, a.status || 'in_progress',
      a.completed_at ? fmtDateTime(a.completed_at) : ''
    ])
    const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `active-tracking-${selectedOrg}-${anonymized ? 'company' : 'internal'}-${fileStamp()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    if (!dashboardRef.current) return
    setExporting(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 12
      const contentW = pageW - margin * 2

      // Reserved zones for the repeating header band and footer, so captured
      // cards never collide with the branding.
      const HEADER_H = 20           // band height on every page
      const FOOTER_H = 14           // footer strip height on every page
      const COVER_EXTRA = anonymized ? 26 : 20  // title block height on page 1
      const contentTop = HEADER_H + 6
      const firstContentTop = HEADER_H + COVER_EXTRA
      const contentBottom = pageH - FOOTER_H
      const maxBlockH = contentBottom - contentTop

      const viewLabel = anonymized ? 'Company View' : 'Internal Team View'
      const generatedAt = new Date().toLocaleString()
      const logo = await loadImage('/happimynd_logo.png')
      const logoAspect = logo && logo.naturalHeight ? logo.naturalWidth / logo.naturalHeight : 4

      // ── Capture each card as its own image so charts are never split ──
      const blocks = [
        dashboardRef.current.querySelector('.at-stats'),
        ...dashboardRef.current.querySelectorAll('.at-chart-card')
      ].filter(Boolean)

      let cursorY = firstContentTop
      for (const el of blocks) {
        // Expand any inner scroll area so the full chart is captured
        const scroll = el.querySelector('.at-chart-scroll')
        const prevMaxH = scroll ? scroll.style.maxHeight : null
        if (scroll) scroll.style.maxHeight = 'none'

        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })

        if (scroll) scroll.style.maxHeight = prevMaxH

        let drawW = contentW
        let drawH = (canvas.height * drawW) / canvas.width
        // Shrink to fit a single page if a card is taller than the usable area
        if (drawH > maxBlockH) {
          drawH = maxBlockH
          drawW = (canvas.width * drawH) / canvas.height
        }
        // Start a new page if this card won't fit in the remaining space
        if (cursorY + drawH > contentBottom) {
          pdf.addPage()
          cursorY = contentTop
        }
        const x = margin + (contentW - drawW) / 2
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, cursorY, drawW, drawH)
        cursorY += drawH + 7
      }

      // ── Stamp the branded header + footer onto every page ──
      // Done after content so we know the final page count for "Page X of Y".
      const drawHeader = () => {
        // Accent bar flush to the top edge
        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(0, 0, pageW, 2.5, 'F')
        // Logo (left), sized by its natural aspect ratio
        if (logo) {
          const h = 8
          pdf.addImage(logo, 'PNG', margin, 7, h * logoAspect, h)
        }
        // Report label (right)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(...PDF_BRAND)
        pdf.text('ACTIVE TRACKING REPORT', pageW - margin, 12, { align: 'right' })
        pdf.setFont('helvetica', 'normal')
        // Hairline divider under the band
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.line(margin, HEADER_H - 2, pageW - margin, HEADER_H - 2)
      }

      const drawFooter = (pageNum, totalPages) => {
        const y = pageH - FOOTER_H + 5
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.line(margin, y, pageW - margin, y)
        pdf.setFontSize(8)
        pdf.setTextColor(...PDF_FAINT)
        pdf.text(
          `HappiMynd · Confidential${anonymized ? ' · Identities anonymized' : ''}`,
          margin, y + 5
        )
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, y + 5, { align: 'right' })
      }

      const drawCover = () => {
        let y = HEADER_H + 8
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(18)
        pdf.setTextColor(...PDF_INK)
        pdf.text(`Active Tracking — ${selectedOrg}`, margin, y)
        pdf.setFont('helvetica', 'normal')
        y += 6
        pdf.setFontSize(10)
        pdf.setTextColor(...PDF_MUTED)
        pdf.text(`${viewLabel}   •   Period: ${periodLabel}   •   Generated ${generatedAt}`, margin, y)
        if (anonymized) {
          y += 6
          pdf.setTextColor(...PDF_BRAND)
          pdf.setFontSize(9)
          pdf.text('Employee identities have been anonymized in this report.', margin, y)
        }
      }

      const total = pdf.getNumberOfPages()
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i)
        drawHeader()
        if (i === 1) drawCover()
        drawFooter(i, total)
      }

      pdf.save(`active-tracking-${selectedOrg}-${anonymized ? 'company' : 'internal'}-${fileStamp()}.pdf`)
    } catch (e) {
      console.error('PDF export failed:', e)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // ── States ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="at-spinner-wrap"><div className="at-spinner" /></div>
    )
  }

  if (error) {
    return (
      <div className="active-tracking">
        <div className="at-alert">Error loading tracking data: {error}</div>
      </div>
    )
  }

  const hasData = viewAttempts.length > 0

  return (
    <div className="active-tracking">
      {/* Header */}
      <div className="at-header">
        <div className="at-header__icon"><InsightsIcon /></div>
        <div className="at-header__text">
          <h1>Active Tracking</h1>
          <p>Select an organization to visualize its employees' assessment performance</p>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="at-empty">
          <InsightsIcon />
          <h3>No data to track yet</h3>
          <p>Once employees complete quizzes, their organizations will appear here.</p>
        </div>
      ) : (
        <>
          {/* Filters + export */}
          <div className="at-controls">
            <div className="at-controls__group">
              <BusinessIcon style={{ color: 'var(--color-primary)' }} />
              <label htmlFor="at-org-select" className="at-controls__label">Organization</label>
              <select
                id="at-org-select"
                className="at-select"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
              >
                {organizations.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>

            <div className="at-controls__group">
              <CalendarMonthIcon style={{ color: 'var(--color-primary)' }} />
              <label htmlFor="at-range-select" className="at-controls__label">Period</label>
              <select
                id="at-range-select"
                className="at-select at-select--sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All time</option>
                <option value="30d">Last 30 days</option>
                <option value="quarter">This quarter</option>
                <option value="custom">Custom…</option>
              </select>
              {dateRange === 'custom' && (
                <span className="at-daterange">
                  <input type="date" className="at-date-input" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} />
                  <span className="at-daterange__sep">to</span>
                  <input type="date" className="at-date-input" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} />
                </span>
              )}
            </div>

            <div className="at-controls__group">
              <label className="at-controls__label">View</label>
              <div className="at-viewtoggle" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`at-viewtoggle__btn ${viewMode === 'internal' ? 'is-active' : ''}`}
                  onClick={() => switchViewMode('internal')}
                  title="Show employee names — for internal monitoring"
                >
                  <VisibilityIcon /> Internal Team
                </button>
                <button
                  type="button"
                  className={`at-viewtoggle__btn ${viewMode === 'company' ? 'is-active' : ''}`}
                  onClick={() => switchViewMode('company')}
                  title="Anonymize employee identities — for company sharing"
                >
                  <VisibilityOffIcon /> Company
                </button>
              </div>
            </div>

            <div className="at-controls__group at-controls__group--end">
              <button className="btn btn--outline" onClick={exportCSV} disabled={!hasData}>
                <TableChartIcon className="btn-icon" /> CSV
              </button>
              <button className="btn btn--primary" onClick={exportPDF} disabled={!hasData || exporting}>
                <PictureAsPdfIcon className="btn-icon" /> {exporting ? 'Exporting…' : 'PDF'}
              </button>
            </div>
          </div>

          {anonymized && hasData && (
            <div className="at-privacy-banner">
              <VisibilityOffIcon />
              <span>
                <strong>Company View</strong> — employee identities are anonymized in the charts and exported reports.
              </span>
            </div>
          )}

          {!hasData ? (
            <div className="at-empty">
              <InsightsIcon />
              <h3>No attempts for {selectedOrg}</h3>
              <p>{dateRange === 'all' ? 'This organization has no recorded quiz attempts yet.' : `No attempts in the selected period (${periodLabel}).`}</p>
            </div>
          ) : (
            <div className="at-dashboard" ref={dashboardRef}>
              {/* Summary cards */}
              <div className="at-stats">
                <div className="at-stat-card">
                  <div className="at-stat-card__icon"><GroupIcon /></div>
                  <div>
                    <div className="at-stat-card__value">{summary.employees}</div>
                    <div className="at-stat-card__label">Employees</div>
                  </div>
                </div>
                <div className="at-stat-card">
                  <div className="at-stat-card__icon"><AssignmentIcon /></div>
                  <div>
                    <div className="at-stat-card__value">{summary.totalAttempts}</div>
                    <div className="at-stat-card__label">Total Attempts</div>
                  </div>
                </div>
                <div className="at-stat-card">
                  <div className="at-stat-card__icon"><InsightsIcon /></div>
                  <div>
                    <div className="at-stat-card__value">{summary.avgScore}%</div>
                    <div className="at-stat-card__label">Average Score</div>
                  </div>
                </div>
                <div className="at-stat-card">
                  <div className="at-stat-card__icon"><EmojiEventsIcon /></div>
                  <div>
                    <div className="at-stat-card__value at-stat-card__value--sm">
                      {summary.top ? summary.top.name : '—'}
                    </div>
                    <div className="at-stat-card__label">
                      Top Performer {summary.top ? `(${summary.top.avgScore}%)` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="at-charts">
                {/* Avg score per employee (horizontal, selectable count, clickable) */}
                <div className="at-chart-card at-chart-card--wide">
                  <div className="at-chart-card__head">
                    <h3 className="at-chart-card__title">
                      Employees by Average Score
                      <span className="at-chart-card__note">
                        {' '}— showing {shownEmployees.length} of {employeeScores.length} · click a bar for details
                      </span>
                    </h3>
                    <div className="at-chart-card__control">
                      <label htmlFor="at-emp-limit">Show</label>
                      <select
                        id="at-emp-limit"
                        className="at-select at-select--sm"
                        value={employeeLimit}
                        onChange={(e) => setEmployeeLimit(e.target.value)}
                      >
                        {EMPLOYEE_LIMIT_OPTIONS.filter(n => n < employeeScores.length).map(n => (
                          <option key={n} value={String(n)}>Top {n}</option>
                        ))}
                        <option value="all">All ({employeeScores.length})</option>
                      </select>
                    </div>
                  </div>
                  <div className="at-chart-scroll">
                    <ResponsiveContainer width="100%" height={Math.max(280, shownEmployees.length * 34)}>
                      <BarChart
                        layout="vertical"
                        data={shownEmployees}
                        margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#727279' }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12, fill: '#727279' }}
                          tickFormatter={(v) => (v.length > 20 ? `${v.slice(0, 19)}…` : v)}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar
                          dataKey="avgScore"
                          name="Avg Score"
                          fill="#895BF5"
                          radius={[0, 6, 6, 0]}
                          barSize={18}
                          cursor="pointer"
                          onClick={(d) => {
                            const name = d?.payload?.name ?? d?.name
                            if (name) setSelectedEmployee(name)
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance distribution */}
                <div className="at-chart-card">
                  <h3 className="at-chart-card__title">
                    Performance Distribution
                    <span className="at-chart-card__note">{' '}— click a slice to see who's in it</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performanceDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(d) => `${d.name}: ${d.value}`}
                        cursor="pointer"
                        onClick={(d) => {
                          const name = d?.name ?? d?.payload?.name
                          if (name) setSelectedBand(name)
                        }}
                      >
                        {performanceDistribution.map((entry) => (
                          <Cell key={entry.name} fill={BAND_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Score trend over time */}
                <div className="at-chart-card">
                  <h3 className="at-chart-card__title">Score Trend Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scoreTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#727279' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#727279' }} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#895BF5" strokeWidth={3} dot={{ r: 4, fill: '#895BF5' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Avg score per quiz (horizontal, sorted, scrollable) */}
                <div className="at-chart-card">
                  <h3 className="at-chart-card__title">Average Score by Quiz</h3>
                  <div className="at-chart-scroll">
                    <ResponsiveContainer width="100%" height={Math.max(240, quizAverages.length * 32)}>
                      <BarChart layout="vertical" data={quizAverages} margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#727279' }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12, fill: '#727279' }}
                          tickFormatter={(v) => (v.length > 20 ? `${v.slice(0, 19)}…` : v)}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="avgScore" name="Avg Score" radius={[0, 6, 6, 0]} barSize={16}>
                          {quizAverages.map((entry, i) => (
                            <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance by area (horizontal, sorted, scrollable) */}
                {packetAverages.length > 0 && (
                  <div className="at-chart-card">
                    <h3 className="at-chart-card__title">Average Performance by Area</h3>
                    <div className="at-chart-scroll">
                      <ResponsiveContainer width="100%" height={Math.max(240, packetAverages.length * 32)}>
                        <BarChart layout="vertical" data={packetAverages} margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#727279' }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={160}
                            tick={{ fontSize: 12, fill: '#727279' }}
                            tickFormatter={(v) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)}
                          />
                          <Tooltip formatter={(v) => `${v}%`} />
                          <Bar dataKey="avgScore" name="Avg %" fill="#A68AF9" radius={[0, 6, 6, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Performance by area — radar view (top areas for readability) */}
                {packetRadar.length >= 3 && (
                  <div className="at-chart-card at-chart-card--wide">
                    <h3 className="at-chart-card__title">
                      Performance by Area — Radar
                      <span className="at-chart-card__note">
                        {packetAverages.length > packetRadar.length
                          ? ` — top ${packetRadar.length} of ${packetAverages.length} areas`
                          : ` — ${packetRadar.length} areas`}
                      </span>
                    </h3>
                    <ResponsiveContainer width="100%" height={420}>
                      <RadarChart data={packetRadar} outerRadius="72%" margin={{ top: 16, right: 48, bottom: 16, left: 48 }}>
                        <PolarGrid stroke="#E4E4E7" />
                        <PolarAngleAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#727279' }}
                          tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                        <Radar name="Avg %" dataKey="avgScore" stroke="#895BF5" fill="#895BF5" fillOpacity={0.35} />
                        <Tooltip formatter={(v) => `${v}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Employee drill-down modal */}
      {employeeDetail && (
        <div className="at-modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="at-modal" onClick={(e) => e.stopPropagation()}>
            <div className="at-modal__header">
              <div>
                <h2 className="at-modal__title">{employeeDetail.name}</h2>
                <p className="at-modal__subtitle">{selectedOrg} · {periodLabel}</p>
              </div>
              <button className="at-modal__close" onClick={() => setSelectedEmployee(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <div className="at-modal__stats">
              <div className="at-modal__stat">
                <div className="at-modal__stat-value">{employeeDetail.avg}%</div>
                <div className="at-modal__stat-label">Average</div>
              </div>
              <div className="at-modal__stat">
                <div className="at-modal__stat-value">{employeeDetail.best}%</div>
                <div className="at-modal__stat-label">Best</div>
              </div>
              <div className="at-modal__stat">
                <div className="at-modal__stat-value">{employeeDetail.worst}%</div>
                <div className="at-modal__stat-label">Lowest</div>
              </div>
              <div className="at-modal__stat">
                <div className="at-modal__stat-value">{employeeDetail.attempts}</div>
                <div className="at-modal__stat-label">Attempts</div>
              </div>
            </div>

            {/* Attempt history */}
            <h3 className="at-modal__section">Attempt History</h3>
            <div className="at-modal__table-wrap">
              <table className="at-modal__table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeDetail.rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.quizName}</td>
                      <td><strong>{r.score}%</strong></td>
                      <td>
                        <span className="at-band-badge" style={{ backgroundColor: BAND_COLORS[scoreBand(r.score)] }}>
                          {scoreBand(r.score)}
                        </span>
                      </td>
                      <td>{r.completed_at ? 'Completed' : 'In Progress'}</td>
                      <td>{fmtDateTime(r.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Packet breakdown */}
            {employeeDetail.packets.length > 0 && (
              <>
                <h3 className="at-modal__section">Performance by Area</h3>
                <div className="at-packet-list">
                  {employeeDetail.packets.map((p) => (
                    <div key={p.packet} className="at-packet-row">
                      <span className="at-packet-row__name">{p.packet}</span>
                      <span className="at-packet-row__bar">
                        <span className="at-packet-row__fill" style={{ width: `${p.score}%` }} />
                      </span>
                      <span className="at-packet-row__val">{p.score}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Performance band drill-down modal */}
      {bandEmployees && (
        <div className="at-modal-overlay" onClick={() => setSelectedBand(null)}>
          <div className="at-modal" onClick={(e) => e.stopPropagation()}>
            <div className="at-modal__header">
              <div>
                <h2 className="at-modal__title">
                  <span className="at-band-badge" style={{ backgroundColor: BAND_COLORS[selectedBand] }}>
                    {selectedBand}
                  </span>
                </h2>
                <p className="at-modal__subtitle">
                  {selectedOrg} · {periodLabel} · {bandEmployees.length} {bandEmployees.length === 1 ? 'person' : 'people'} (by average score)
                </p>
              </div>
              <button className="at-modal__close" onClick={() => setSelectedBand(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {bandEmployees.length === 0 ? (
              <p className="at-modal__subtitle">No employees fall in this band for the current selection.</p>
            ) : (
              <div className="at-modal__table-wrap">
                <table className="at-modal__table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Avg Score</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bandEmployees.map((e) => (
                      <tr
                        key={e.name}
                        className="at-modal__row--clickable"
                        onClick={() => { setSelectedBand(null); setSelectedEmployee(e.name) }}
                        title="View details"
                      >
                        <td>{e.name}</td>
                        <td><strong>{e.avgScore}%</strong></td>
                        <td>{e.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveTracking
