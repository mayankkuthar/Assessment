import React, { useState, useMemo, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import InsightsIcon from '@mui/icons-material/Insights'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import AddChartIcon from '@mui/icons-material/Addchart'
import TableChartIcon from '@mui/icons-material/TableChart'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import StorageIcon from '@mui/icons-material/Storage'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import './DetailedInsights.css'

// Shared brand palette (kept in sync with ActiveTracking)
const CHART_COLORS = ['#895BF5', '#A68AF9', '#BF83FC', '#7D89F7', '#727279', '#C7B3FD', '#5C6BC0', '#9575CD']

// Brand palette as RGB tuples for jsPDF (mirrors the Active Tracking export so
// both reports share one visual identity).
const PDF_BRAND = [137, 91, 245]   // #895BF5
const PDF_INK = [24, 24, 27]       // near-black body text
const PDF_MUTED = [114, 114, 121]  // secondary text
const PDF_FAINT = [161, 161, 170]  // footer / captions
const PDF_HAIRLINE = [228, 228, 231]

// Preload an image for the PDF; resolves null on failure so a missing logo
// never breaks the export.
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

// Columns with more distinct values than this are treated as free text
// (a multi-select of hundreds of values is useless as a filter / dimension).
const MAX_CATEGORICAL_CARDINALITY = 50
// Cap categories drawn in a chart so labels stay readable; the rest roll into "Other".
const MAX_CHART_CATEGORIES = 15
const TABLE_PAGE_SIZE = 10

const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

const toNumber = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (isBlank(v)) return null
  const n = Number(String(v).replace(/[, ]/g, ''))
  return Number.isFinite(n) ? n : null
}

// Parse a value into a timestamp if it looks like a date (has date/time
// separators so plain words and bare numbers aren't mistaken for dates).
const parseDate = (v) => {
  if (v instanceof Date) return v.getTime()
  if (typeof v === 'number') return null
  const s = String(v ?? '').trim()
  if (!s || (!/[-/]/.test(s) && !/\d{1,2}:\d{2}/.test(s))) return null
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

// Infer a column's type by sampling its non-blank values.
const inferType = (rows, col) => {
  const values = rows.map(r => r[col]).filter(v => !isBlank(v))
  if (values.length === 0) return 'text'
  if (values.every(v => toNumber(v) !== null)) return 'numeric'
  if (values.every(v => parseDate(v) !== null)) return 'date'
  const distinct = new Set(values.map(v => String(v)))
  if (distinct.size <= MAX_CATEGORICAL_CARDINALITY) return 'categorical'
  return 'text'
}

// Distinct non-blank value count for a column.
const distinctCount = (rows, col) =>
  new Set(rows.map(r => String(r[col] ?? '').trim()).filter(Boolean)).size

const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const AGG_LABELS = { count: 'Count', sum: 'Sum', avg: 'Average', min: 'Min', max: 'Max' }

const round1 = (v) => Math.round(v * 10) / 10

// Group rows by a categorical column and average a numeric metric within each
// group (falling back to row counts when there is no metric).
const groupStats = (rows, dim, metric) => {
  const groups = {}
  rows.forEach(r => {
    const k = (String(r[dim] ?? '').trim()) || '—'
    if (!groups[k]) groups[k] = { vals: [], count: 0 }
    groups[k].count += 1
    if (metric) {
      const n = toNumber(r[metric])
      if (n !== null) groups[k].vals.push(n)
    }
  })
  return Object.entries(groups)
    .map(([name, g]) => ({
      name,
      count: g.count,
      value: metric && g.vals.length
        ? round1(g.vals.reduce((s, n) => s + n, 0) / g.vals.length)
        : g.count
    }))
    .sort((a, b) => b.value - a.value)
}

// Derive an at-a-glance narrative + highlight stats for the current rows,
// focused on the chosen metric (e.g. assessment score) across each dimension.
const computeInsights = (rows, metric, catCols) => {
  if (!rows.length) return null
  const nums = metric ? rows.map(r => toNumber(r[metric])).filter(n => n !== null) : []
  const hasMetric = nums.length > 0
  const avg = hasMetric ? round1(nums.reduce((s, n) => s + n, 0) / nums.length) : null
  const highest = hasMetric ? round1(Math.max(...nums)) : null
  const lowest = hasMetric ? round1(Math.min(...nums)) : null

  const dimStats = catCols
    .map(c => {
      const arr = groupStats(rows, c.name, hasMetric ? metric : null)
      if (arr.length < 2) return null
      return { dim: c.name, groups: arr.length, top: arr[0], bottom: arr[arr.length - 1] }
    })
    .filter(Boolean)

  const bullets = []
  if (hasMetric) {
    bullets.push(`Average ${metric} is ${avg} across ${rows.length} record${rows.length === 1 ? '' : 's'}, ranging from ${lowest} to ${highest}.`)
  } else {
    bullets.push(`${rows.length} record${rows.length === 1 ? '' : 's'} in the current selection.`)
  }
  dimStats.forEach(d => {
    if (hasMetric) {
      bullets.push(`By ${d.dim}, ${d.top.name} leads at ${d.top.value} while ${d.bottom.name} trails at ${d.bottom.value}.`)
    } else {
      bullets.push(`Most common ${d.dim}: ${d.top.name} (${d.top.count}); least common: ${d.bottom.name} (${d.bottom.count}).`)
    }
  })

  return { hasMetric, metric, avg, highest, lowest, count: rows.length, dimStats, bullets }
}

const DetailedInsights = ({ onBack, liveDataset }) => {
  const [fileName, setFileName] = useState('')
  const [columns, setColumns] = useState([])      // [{ name, type }]
  const [rows, setRows] = useState([])            // raw parsed rows (objects)
  const [parseError, setParseError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  // Filter state, keyed by column name:
  //  categorical -> array of selected values ([] = no constraint)
  //  numeric     -> { min, max }
  //  text        -> search substring
  const [filters, setFilters] = useState({})
  const [widgets, setWidgets] = useState([])      // dynamic chart configs
  const [showFilters, setShowFilters] = useState(true)
  const [tablePage, setTablePage] = useState(0)
  const [insightMetric, setInsightMetric] = useState('') // numeric column driving Key Insights
  const [drill, setDrill] = useState(null) // { type:'category'|'range', ... } for the detail modal

  // View mode mirrors Active Tracking: 'internal' shows real names; 'company'
  // anonymizes the chosen identity column so filtered reports can be shared
  // without exposing individual employees.
  const [viewMode, setViewMode] = useState('internal') // 'internal' | 'company'
  const [identityColumn, setIdentityColumn] = useState('') // column whose values get anonymized
  const [exporting, setExporting] = useState(false)

  const fileInputRef = useRef(null)
  const dashboardRef = useRef(null)

  // Load a set of rows into the dashboard. `order` optionally fixes the column
  // order (header row for Excel; explicit list for the live dataset).
  const loadRows = useCallback((name, rawRows, order) => {
    if (!rawRows || !rawRows.length) {
      setParseError('There is no data to analyze.')
      return
    }
    const names = (order && order.length ? order : Object.keys(rawRows[0]))
      .map(h => String(h).trim()).filter(Boolean)
    const cols = names.map(colName => ({ name: colName, type: inferType(rawRows, colName) }))
    setFileName(name)
    setColumns(cols)
    setRows(rawRows)
    setFilters({})
    setTablePage(0)
    setWidgets(buildDefaultWidgets(cols, rawRows))
    setInsightMetric(cols.find(c => c.type === 'numeric')?.name || '')
    // Default the identity column to the highest-cardinality dimension — the
    // "who" of the dataset (e.g. Employee) — so Company view anonymizes the
    // right column out of the box.
    const idCandidate = cols
      .filter(c => c.type === 'categorical' || c.type === 'text')
      .map(c => ({ name: c.name, card: distinctCount(rawRows, c.name) }))
      .sort((a, b) => b.card - a.card)[0]
    setIdentityColumn(idCandidate?.name || '')
    setParseError(null)
  }, [])

  // ── File parsing ───────────────────────────────────────────
  const parseWorkbook = useCallback((file) => {
    setParseError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        const headerOrder = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || []
        loadRows(file.name, raw, headerOrder)
      } catch (err) {
        console.error('Excel parse error:', err)
        setParseError('Could not read this file. Please upload a valid .xlsx, .xls or .csv file.')
      }
    }
    reader.onerror = () => setParseError('Failed to read the file.')
    reader.readAsArrayBuffer(file)
  }, [loadRows])

  const loadLiveData = () => {
    if (liveDataset) loadRows(liveDataset.name, liveDataset.rows, liveDataset.columns)
  }

  const handleFiles = (fileList) => {
    const file = fileList && fileList[0]
    if (file) parseWorkbook(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const resetAll = () => {
    setFileName('')
    setColumns([])
    setRows([])
    setFilters({})
    setWidgets([])
    setParseError(null)
    setTablePage(0)
    setViewMode('internal')
    setIdentityColumn('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const anonymized = viewMode === 'company' && Boolean(identityColumn)

  // ── Anonymization ──────────────────────────────────────────
  // Map each distinct identity value to a sequential "User N" label, ranked by
  // performance (highest average of the first numeric column = User 1). See the
  // ranking detail below. Computed over the full dataset so a value's label
  // stays stable regardless of the active filters.
  const anonMap = useMemo(() => {
    if (!anonymized) return null
    // Rank on the same metric the entity bar chart plots — the first numeric
    // column, averaged and rounded to one decimal exactly as the charts do —
    // rather than the user-selectable focus metric, which can diverge from the
    // chart's measure. Matching the chart's value + rounding (and its stable,
    // first-appearance ordering) makes the per-user chart read User 1, User 2,
    // … in order with no gaps. Falls back to record count when the dataset has
    // no numeric column (the chart ranks by count in that case too).
    const rankMetric = columns.find(c => c.type === 'numeric')?.name || ''
    const groups = {}
    rows.forEach(r => {
      const k = (String(r[identityColumn] ?? '').trim()) || '—'
      if (!groups[k]) groups[k] = { total: 0, nums: 0, count: 0 }
      groups[k].count += 1
      if (rankMetric) {
        const n = toNumber(r[rankMetric])
        if (n !== null) { groups[k].total += n; groups[k].nums += 1 }
      }
    })
    const ranked = Object.entries(groups)
      .map(([name, g]) => ({ name, rank: g.nums ? round1(g.total / g.nums) : g.count }))
      .sort((a, b) => b.rank - a.rank)
    const map = {}
    ranked.forEach((e, i) => { map[e.name] = `User ${i + 1}` })
    return map
  }, [anonymized, rows, identityColumn, columns])

  // Rows as seen by every downstream consumer (filters, charts, table, export).
  // In Company view the identity column is swapped for its anonymous label so
  // the anonymization propagates everywhere automatically.
  const displayRows = useMemo(() => {
    if (!anonMap) return rows
    return rows.map(r => ({
      ...r,
      [identityColumn]: anonMap[(String(r[identityColumn] ?? '').trim()) || '—'] || 'User'
    }))
  }, [rows, anonMap, identityColumn])

  // ── Distinct values & numeric bounds per column ────────────
  const columnMeta = useMemo(() => {
    const meta = {}
    columns.forEach(({ name, type }) => {
      if (type === 'categorical') {
        const distinct = [...new Set(displayRows.map(r => String(r[name] ?? '')).filter(v => v !== ''))]
          .sort((a, b) => a.localeCompare(b))
        meta[name] = { distinct }
      } else if (type === 'numeric') {
        const nums = displayRows.map(r => toNumber(r[name])).filter(n => n !== null)
        meta[name] = nums.length
          ? { min: Math.min(...nums), max: Math.max(...nums) }
          : { min: 0, max: 0 }
      }
    })
    return meta
  }, [columns, displayRows])

  // ── Apply filters ──────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return displayRows.filter(row => {
      for (const { name, type } of columns) {
        const f = filters[name]
        if (f == null) continue
        if (type === 'categorical') {
          if (f.length && !f.includes(String(row[name] ?? ''))) return false
        } else if (type === 'numeric') {
          const n = toNumber(row[name])
          if (f.min != null && (n == null || n < f.min)) return false
          if (f.max != null && (n == null || n > f.max)) return false
        } else if (type === 'date') {
          const t = parseDate(row[name])
          if (f.from && (t == null || t < Date.parse(`${f.from}T00:00:00`))) return false
          if (f.to && (t == null || t > Date.parse(`${f.to}T23:59:59`))) return false
        } else {
          if (f && !String(row[name] ?? '').toLowerCase().includes(f.toLowerCase())) return false
        }
      }
      return true
    })
  }, [displayRows, columns, filters])

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0
      if (v && typeof v === 'object') return v.min != null || v.max != null || v.from || v.to
      return Boolean(v)
    }).length
  }, [filters])

  // ── Filter setters ─────────────────────────────────────────
  const toggleCategorical = (col, value) => {
    setTablePage(0)
    setFilters(prev => {
      const cur = prev[col] || []
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
      return { ...prev, [col]: next }
    })
  }
  const setNumericFilter = (col, key, value) => {
    setTablePage(0)
    setFilters(prev => ({
      ...prev,
      [col]: { ...(prev[col] || {}), [key]: value === '' ? null : Number(value) }
    }))
  }
  const setTextFilter = (col, value) => {
    setTablePage(0)
    setFilters(prev => ({ ...prev, [col]: value }))
  }
  const setDateFilter = (col, key, value) => {
    setTablePage(0)
    setFilters(prev => ({ ...prev, [col]: { ...(prev[col] || {}), [key]: value || null } }))
  }
  const clearFilters = () => { setFilters({}); setTablePage(0) }

  // Drop any filter on the identity column — its values differ between modes,
  // so a stored selection wouldn't match. Also clear the open drill-down.
  const dropIdentityState = () => {
    setDrill(null)
    setTablePage(0)
    setFilters(prev => {
      if (prev[identityColumn] == null) return prev
      const next = { ...prev }
      delete next[identityColumn]
      return next
    })
  }
  const switchViewMode = (mode) => {
    if (mode === viewMode) return
    dropIdentityState()
    setViewMode(mode)
  }
  const changeIdentityColumn = (col) => {
    if (col === identityColumn) return
    setDrill(null)
    setTablePage(0)
    // Both the previously-anonymized column (now reverting to real names) and
    // the newly-anonymized one change their values, so any filter on either
    // would no longer match — drop them to avoid silently emptying the view.
    setFilters(prev => {
      if (prev[identityColumn] == null && prev[col] == null) return prev
      const next = { ...prev }
      delete next[identityColumn]
      delete next[col]
      return next
    })
    setIdentityColumn(col)
  }

  // ── Dynamic widgets ────────────────────────────────────────
  const categoricalCols = useMemo(() => columns.filter(c => c.type === 'categorical'), [columns])
  const numericCols = useMemo(() => columns.filter(c => c.type === 'numeric'), [columns])
  // Anything that isn't a measure can be a grouping dimension (high-cardinality
  // columns like names stay usable thanks to the Top-N control on each chart).
  const dimensionCols = useMemo(() => columns.filter(c => c.type !== 'numeric'), [columns])
  // Columns eligible to act as the identity to anonymize (names live in
  // categorical/text columns, never numeric measures or dates).
  const identityCols = useMemo(() => columns.filter(c => c.type === 'categorical' || c.type === 'text'), [columns])

  const addWidget = () => {
    const dim = dimensionCols[0]?.name || columns[0]?.name
    if (!dim) return
    const dimType = columns.find(c => c.name === dim)?.type
    setWidgets(prev => [...prev, {
      id: `w_${Date.now()}_${prev.length}`,
      type: dimType === 'date' ? 'line' : 'bar',
      dimension: dim,
      measure: 'count',
      agg: 'count',
      topN: 15
    }])
  }
  const updateWidget = (id, patch) =>
    setWidgets(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)))
  const removeWidget = (id) => setWidgets(prev => prev.filter(w => w.id !== id))

  // ── Auto-generated insights ────────────────────────────────
  const insights = useMemo(
    () => computeInsights(filteredRows, insightMetric, categoricalCols),
    [filteredRows, insightMetric, categoricalCols]
  )

  // ── Drill-down detail (click a bar / pie slice) ────────────
  const drillResult = useMemo(() => {
    if (!drill) return null
    let selected, title
    if (drill.type === 'range') {
      selected = filteredRows.filter(r => {
        const n = toNumber(r[drill.column])
        return n !== null && n >= drill.lo && n <= drill.hi
      })
      title = `${drill.column}: ${drill.label}`
    } else {
      selected = filteredRows.filter(r => (String(r[drill.column] ?? '').trim() || '—') === String(drill.value))
      title = String(drill.value)
    }
    let stats = null
    if (insightMetric) {
      const nums = selected.map(r => toNumber(r[insightMetric])).filter(n => n !== null)
      if (nums.length) {
        stats = {
          metric: insightMetric,
          avg: round1(nums.reduce((s, n) => s + n, 0) / nums.length),
          high: round1(Math.max(...nums)),
          low: round1(Math.min(...nums))
        }
      }
    }
    return { title, column: drill.column, rows: selected, stats }
  }, [drill, filteredRows, insightMetric])

  // ── KPI summary ────────────────────────────────────────────
  const summary = useMemo(() => ({
    total: displayRows.length,
    filtered: filteredRows.length,
    columns: columns.length,
    dimensions: categoricalCols.length,
    metrics: numericCols.length
  }), [displayRows, filteredRows, columns, categoricalCols, numericCols])

  const hasData = rows.length > 0

  // ── Exports ────────────────────────────────────────────────
  const reportName = (fileName || 'detailed-insights').replace(/\.[^.]+$/, '')
  const fileStamp = () => new Date().toISOString().split('T')[0]

  // Export the filtered, view-aware dataset as a flat CSV.
  const exportCSV = () => {
    const headers = columns.map(c => c.name)
    const body = filteredRows.map(r => headers.map(h => r[h]))
    const csv = [headers, ...body].map(r => r.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName}-${anonymized ? 'company' : 'internal'}-${fileStamp()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Build a branded multi-page PDF of the dashboards, formatted to match the
  // Active Tracking report (cover → executive summary → key insights → charts).
  const exportPDF = async () => {
    if (!dashboardRef.current) return
    setExporting(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 14
      const contentW = pageW - margin * 2

      const HEADER_H = 22
      const FOOTER_H = 14
      const contentTop = HEADER_H + 8
      const contentBottom = pageH - FOOTER_H - 2

      const viewLabel = anonymized ? 'Company View' : 'Internal View'
      const generatedAt = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      const logo = await loadImage('/happimynd_logo.png')
      const logoAspect = logo && logo.naturalHeight ? logo.naturalWidth / logo.naturalHeight : 4

      const fitText = (str, maxW) => {
        let s = String(str ?? '')
        if (pdf.getTextWidth(s) <= maxW) return s
        while (s.length > 1 && pdf.getTextWidth(`${s}…`) > maxW) s = s.slice(0, -1)
        return `${s}…`
      }

      // ── 1. Cover page ──────────────────────────────────────
      const drawCover = () => {
        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(0, 0, pageW, 4, 'F')
        if (logo) {
          const h = 16
          const w = h * logoAspect
          pdf.addImage(logo, 'PNG', (pageW - w) / 2, 56, w, h)
        }
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(...PDF_BRAND)
        pdf.text('DETAILED INSIGHTS REPORT', pageW / 2, 92, { align: 'center' })

        pdf.setFontSize(30)
        pdf.setTextColor(...PDF_INK)
        pdf.text(fitText(reportName, contentW), pageW / 2, 108, { align: 'center' })

        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(pageW / 2 - 16, 114, 32, 1.2, 'F')

        const boxW = 130
        const boxX = (pageW - boxW) / 2
        const boxY = 130
        const metaRows = [
          ['View', viewLabel],
          ['Records', `${summary.filtered} of ${summary.total}`],
          ['Active filters', String(activeFilterCount)],
          ['Generated', generatedAt]
        ]
        const rowH = 11
        const boxH = metaRows.length * rowH + 8
        pdf.setFillColor(249, 248, 254)
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD')
        metaRows.forEach(([label, value], i) => {
          const ry = boxY + 8 + i * rowH
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(8.5)
          pdf.setTextColor(...PDF_MUTED)
          pdf.text(label.toUpperCase(), boxX + 8, ry)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(...PDF_INK)
          pdf.text(fitText(value, boxW - 52), boxX + 44, ry)
        })

        if (anonymized) {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(9)
          pdf.setTextColor(...PDF_BRAND)
          pdf.text(
            `Identities in “${identityColumn}” have been anonymized in this report.`,
            pageW / 2, boxY + boxH + 12, { align: 'center' }
          )
        }
      }

      // ── 2. Repeating header / footer on content pages ──────
      const drawHeader = () => {
        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(0, 0, pageW, 2.5, 'F')
        if (logo) {
          const h = 8
          pdf.addImage(logo, 'PNG', margin, 8, h * logoAspect, h)
        }
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(...PDF_BRAND)
        pdf.text(`Detailed Insights · ${fitText(reportName, 70)}`, pageW - margin, 13, { align: 'right' })
        pdf.setFont('helvetica', 'normal')
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.line(margin, HEADER_H - 3, pageW - margin, HEADER_H - 3)
      }

      const drawFooter = (pageNum, totalPages) => {
        const y = pageH - FOOTER_H + 5
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.line(margin, y, pageW - margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(...PDF_FAINT)
        pdf.text(
          `HappiMynd · Confidential${anonymized ? ' · Identities anonymized' : ''}`,
          margin, y + 5
        )
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, y + 5, { align: 'right' })
      }

      const drawSectionTitle = (title, note, y) => {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(13)
        pdf.setTextColor(...PDF_INK)
        pdf.text(title, margin, y)
        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(margin, y + 2.5, 18, 1, 'F')
        let next = y + 7
        if (note) {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8.5)
          pdf.setTextColor(...PDF_MUTED)
          pdf.text(fitText(note, contentW), margin, next)
          next += 4
        }
        return next
      }

      // ── Cover ──
      drawCover()

      // ── 3. Executive summary (native vector) ───────────────
      pdf.addPage()
      let cursorY = drawSectionTitle('Executive Summary', '', contentTop) + 4

      const tiles = insights && insights.hasMetric
        ? [
            { value: String(insights.avg), label: `Avg ${insights.metric}` },
            { value: String(insights.highest), label: 'Highest' },
            { value: String(insights.lowest), label: 'Lowest' },
            { value: String(summary.filtered), label: 'Records' }
          ]
        : [
            { value: String(summary.filtered), label: 'Rows Shown' },
            { value: String(summary.total), label: 'Total Rows' },
            { value: String(summary.dimensions), label: 'Dimensions' },
            { value: String(summary.metrics), label: 'Metrics' }
          ]
      const gap = 4
      const tileW = (contentW - gap * (tiles.length - 1)) / tiles.length
      const tileH = 24
      tiles.forEach((t, i) => {
        const x = margin + i * (tileW + gap)
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(...PDF_HAIRLINE)
        pdf.setLineWidth(0.3)
        pdf.roundedRect(x, cursorY, tileW, tileH, 2.5, 2.5, 'FD')
        pdf.setFillColor(...PDF_BRAND)
        pdf.rect(x, cursorY + 3, 1.4, tileH - 6, 'F')
        const tx = x + 6
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(18)
        pdf.setTextColor(...PDF_BRAND)
        pdf.text(fitText(t.value, tileW - 9), tx, cursorY + 13)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(...PDF_MUTED)
        pdf.text(fitText(t.label, tileW - 9), tx, cursorY + 18.5)
      })
      cursorY += tileH + 10

      // Key insights (reuse the on-screen narrative bullets)
      if (insights && insights.bullets.length) {
        cursorY = drawSectionTitle('Key Insights', '', cursorY) + 3
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9.5)
        insights.bullets.forEach((line) => {
          pdf.setFillColor(...PDF_BRAND)
          pdf.circle(margin + 1.4, cursorY - 1.1, 1, 'F')
          pdf.setTextColor(...PDF_INK)
          const wrapped = pdf.splitTextToSize(line, contentW - 7)
          pdf.text(wrapped, margin + 6, cursorY)
          cursorY += wrapped.length * 5 + 2.5
        })
      }

      // ── 4. Chart sections ──────────────────────────────────
      const cards = [...dashboardRef.current.querySelectorAll('.di-chart-card')]
      for (const card of cards) {
        const titleEl = card.querySelector('.di-chart-card__title')
        const title = titleEl ? titleEl.textContent.trim() : 'Chart'

        const chartEl = card.querySelector('.recharts-responsive-container')
        if (!chartEl) continue
        const scroll = card.querySelector('.di-chart-scroll')
        const prevMaxH = scroll ? scroll.style.maxHeight : null
        if (scroll) scroll.style.maxHeight = 'none'

        const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
        if (scroll) scroll.style.maxHeight = prevMaxH

        const titleBlockH = 9
        let drawW = contentW
        let drawH = (canvas.height * drawW) / canvas.width
        const maxImgH = contentBottom - contentTop - titleBlockH
        if (drawH > maxImgH) {
          drawH = maxImgH
          drawW = (canvas.width * drawH) / canvas.height
        }

        if (cursorY + titleBlockH + drawH > contentBottom) {
          pdf.addPage()
          cursorY = contentTop
        } else {
          cursorY += 6
        }

        cursorY = drawSectionTitle(title, '', cursorY)
        const x = margin + (contentW - drawW) / 2
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, cursorY, drawW, drawH)
        cursorY += drawH
      }

      // ── 5. Stamp header/footer (cover keeps its own band) ──
      const total = pdf.getNumberOfPages()
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i)
        if (i > 1) drawHeader()
        drawFooter(i, total)
      }

      pdf.save(`${reportName}-${anonymized ? 'company' : 'internal'}-${fileStamp()}.pdf`)
    } catch (e) {
      console.error('PDF export failed:', e)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="di">
      {/* Header */}
      <div className="di-header">
        <button className="di-back" onClick={onBack} aria-label="Back to Active Tracking">
          <ArrowBackIcon />
        </button>
        <div className="di-header__icon"><InsightsIcon /></div>
        <div className="di-header__text">
          <h1>Detailed Insights</h1>
          <p>Upload an employee spreadsheet, filter by its attributes, and build dynamic dashboards</p>
        </div>
        {hasData && (
          <button className="btn btn--outline di-header__reset" onClick={resetAll}>
            <RestartAltIcon className="btn-icon" /> New file
          </button>
        )}
      </div>

      {!hasData ? (
        /* ── Upload zone ── */
        <>
          <div
            className={`di-dropzone ${dragOver ? 'is-dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            <UploadFileIcon />
            <h3>Drop an Excel file here, or click to browse</h3>
            <p>Supports .xlsx, .xls and .csv — the first row should contain column headers</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {liveDataset && liveDataset.rows.length > 0 && (
            <div className="di-or">
              <span>or</span>
            </div>
          )}
          {liveDataset && liveDataset.rows.length > 0 && (
            <button className="di-livecard" onClick={loadLiveData}>
              <div className="di-livecard__icon"><StorageIcon /></div>
              <div className="di-livecard__text">
                <h3>Use current tracking data</h3>
                <p>Analyze the {liveDataset.rows.length} assessment {liveDataset.rows.length === 1 ? 'attempt' : 'attempts'} already in Active Tracking — no file needed</p>
              </div>
            </button>
          )}

          {parseError && <div className="di-alert">{parseError}</div>}
        </>
      ) : (
        <>
          {parseError && <div className="di-alert">{parseError}</div>}

          {/* File / KPI bar */}
          <div className="di-meta">
            <div className="di-meta__file">
              <TableChartIcon />
              <span>{fileName}</span>
            </div>
            <div className="di-kpis">
              <div className="di-kpi"><span className="di-kpi__value">{summary.filtered}</span><span className="di-kpi__label">Rows shown</span></div>
              <div className="di-kpi"><span className="di-kpi__value">{summary.total}</span><span className="di-kpi__label">Total rows</span></div>
              <div className="di-kpi"><span className="di-kpi__value">{summary.columns}</span><span className="di-kpi__label">Attributes</span></div>
              <div className="di-kpi"><span className="di-kpi__value">{summary.dimensions}</span><span className="di-kpi__label">Dimensions</span></div>
              <div className="di-kpi"><span className="di-kpi__value">{summary.metrics}</span><span className="di-kpi__label">Metrics</span></div>
            </div>
          </div>

          {/* View mode — anonymize identities for shareable company reports */}
          <div className="di-viewbar">
            <div className="di-viewbar__group">
              <label className="di-viewbar__label">View</label>
              <div className="di-viewtoggle" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`di-viewtoggle__btn ${viewMode === 'internal' ? 'is-active' : ''}`}
                  onClick={() => switchViewMode('internal')}
                  title="Show real identities — for internal use"
                >
                  <VisibilityIcon /> Internal
                </button>
                <button
                  type="button"
                  className={`di-viewtoggle__btn ${viewMode === 'company' ? 'is-active' : ''}`}
                  onClick={() => switchViewMode('company')}
                  disabled={identityCols.length === 0}
                  title={identityCols.length ? 'Anonymize identities — for company sharing' : 'No text column available to anonymize'}
                >
                  <VisibilityOffIcon /> Company
                </button>
              </div>
            </div>

            {viewMode === 'company' && identityCols.length > 0 && (
              <div className="di-viewbar__group">
                <label className="di-viewbar__label" htmlFor="di-identity-select">Anonymize</label>
                <select
                  id="di-identity-select"
                  className="di-select"
                  value={identityColumn}
                  onChange={(e) => changeIdentityColumn(e.target.value)}
                >
                  {identityCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div className="di-viewbar__group di-viewbar__group--end">
              <button className="btn btn--outline" onClick={exportCSV} disabled={summary.filtered === 0}>
                <TableChartIcon className="btn-icon" /> CSV
              </button>
              <button className="btn btn--primary" onClick={exportPDF} disabled={summary.filtered === 0 || exporting}>
                <PictureAsPdfIcon className="btn-icon" /> {exporting ? 'Exporting…' : 'PDF'}
              </button>
            </div>
          </div>

          {anonymized && (
            <div className="di-privacy-banner">
              <VisibilityOffIcon />
              <span>
                <strong>Company View</strong> — values in <strong>{identityColumn}</strong> are
                replaced with “User 1, User 2, …” (ranked by {insightMetric ? `average ${insightMetric}` : 'record count'})
                across every chart, table and export.
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="di-panel">
            <div className="di-panel__head">
              <h2><FilterAltIcon /> Filters {activeFilterCount > 0 && <span className="di-badge">{activeFilterCount}</span>}</h2>
              <div className="di-panel__actions">
                {activeFilterCount > 0 && (
                  <button className="di-link" onClick={clearFilters}>Clear all</button>
                )}
                <button className="di-link" onClick={() => setShowFilters(s => !s)}>
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="di-filters">
                {columns.map(({ name, type }) => (
                  <div key={name} className="di-filter">
                    <div className="di-filter__label">
                      {name} <span className="di-filter__type">{type}</span>
                    </div>

                    {type === 'categorical' && (
                      <div className="di-chips">
                        {columnMeta[name]?.distinct.map(val => {
                          const active = (filters[name] || []).includes(val)
                          return (
                            <button
                              key={val}
                              className={`di-chip ${active ? 'is-active' : ''}`}
                              onClick={() => toggleCategorical(name, val)}
                            >
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {type === 'numeric' && (
                      <div className="di-range">
                        <input
                          type="number"
                          className="di-input"
                          placeholder={`min (${columnMeta[name]?.min ?? ''})`}
                          value={filters[name]?.min ?? ''}
                          onChange={(e) => setNumericFilter(name, 'min', e.target.value)}
                        />
                        <span className="di-range__sep">–</span>
                        <input
                          type="number"
                          className="di-input"
                          placeholder={`max (${columnMeta[name]?.max ?? ''})`}
                          value={filters[name]?.max ?? ''}
                          onChange={(e) => setNumericFilter(name, 'max', e.target.value)}
                        />
                      </div>
                    )}

                    {type === 'date' && (
                      <div className="di-range">
                        <input
                          type="date"
                          className="di-input"
                          value={filters[name]?.from || ''}
                          max={filters[name]?.to || undefined}
                          onChange={(e) => setDateFilter(name, 'from', e.target.value)}
                        />
                        <span className="di-range__sep">–</span>
                        <input
                          type="date"
                          className="di-input"
                          value={filters[name]?.to || ''}
                          min={filters[name]?.from || undefined}
                          onChange={(e) => setDateFilter(name, 'to', e.target.value)}
                        />
                      </div>
                    )}

                    {type === 'text' && (
                      <input
                        type="text"
                        className="di-input di-input--full"
                        placeholder={`Search ${name}…`}
                        value={filters[name] || ''}
                        onChange={(e) => setTextFilter(name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key insights */}
          {insights && (
            <div className="di-panel">
              <div className="di-panel__head">
                <h2><LightbulbIcon /> Key Insights</h2>
                {numericCols.length > 0 && (
                  <div className="di-metric-pick">
                    <label>Focus metric</label>
                    <select className="di-select" value={insightMetric} onChange={(e) => setInsightMetric(e.target.value)}>
                      {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {insights.hasMetric && (
                <div className="di-highlights">
                  <div className="di-highlight">
                    <div className="di-highlight__icon"><InsightsIcon /></div>
                    <div>
                      <div className="di-highlight__value">{insights.avg}</div>
                      <div className="di-highlight__label">Average {insights.metric}</div>
                    </div>
                  </div>
                  <div className="di-highlight">
                    <div className="di-highlight__icon di-highlight__icon--up"><TrendingUpIcon /></div>
                    <div>
                      <div className="di-highlight__value">{insights.highest}</div>
                      <div className="di-highlight__label">Highest</div>
                    </div>
                  </div>
                  <div className="di-highlight">
                    <div className="di-highlight__icon di-highlight__icon--down"><TrendingDownIcon /></div>
                    <div>
                      <div className="di-highlight__value">{insights.lowest}</div>
                      <div className="di-highlight__label">Lowest</div>
                    </div>
                  </div>
                  {insights.dimStats[0] && (
                    <div className="di-highlight">
                      <div className="di-highlight__icon di-highlight__icon--gold"><EmojiEventsIcon /></div>
                      <div>
                        <div className="di-highlight__value di-highlight__value--sm">{insights.dimStats[0].top.name}</div>
                        <div className="di-highlight__label">Top {insights.dimStats[0].dim} ({insights.dimStats[0].top.value})</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ul className="di-bullets">
                {insights.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {/* Dynamic dashboard */}
          <div className="di-panel" ref={dashboardRef}>
            <div className="di-panel__head">
              <h2><InsightsIcon /> Dashboards</h2>
              <button className="btn btn--primary" onClick={addWidget}>
                <AddChartIcon className="btn-icon" /> Add chart
              </button>
            </div>

            {widgets.length === 0 ? (
              <div className="di-empty-charts">No charts yet — click “Add chart” to build one.</div>
            ) : (
              <div className="di-charts">
                {widgets.map(w => (
                  <ChartWidget
                    key={w.id}
                    widget={w}
                    rows={filteredRows}
                    columns={columns}
                    dimensionCols={dimensionCols}
                    numericCols={numericCols}
                    onUpdate={updateWidget}
                    onRemove={removeWidget}
                    onDrill={setDrill}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Data table */}
          <DataTable
            columns={columns}
            rows={filteredRows}
            fileName={fileName}
            anonymized={anonymized}
            page={tablePage}
            onPage={setTablePage}
          />
        </>
      )}

      {/* Drill-down detail modal */}
      {drillResult && (
        <div className="di-modal-overlay" onClick={() => setDrill(null)}>
          <div className="di-modal" onClick={(e) => e.stopPropagation()}>
            <div className="di-modal__head">
              <div>
                <h2 className="di-modal__title">{drillResult.title}</h2>
                <p className="di-modal__subtitle">
                  {drillResult.column} · {drillResult.rows.length} record{drillResult.rows.length === 1 ? '' : 's'}
                </p>
              </div>
              <button className="di-chart-card__remove" onClick={() => setDrill(null)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {drillResult.stats && (
              <div className="di-modal__stats">
                <div className="di-modal__stat"><div className="di-modal__stat-value">{drillResult.stats.avg}</div><div className="di-modal__stat-label">Avg {drillResult.stats.metric}</div></div>
                <div className="di-modal__stat"><div className="di-modal__stat-value">{drillResult.stats.high}</div><div className="di-modal__stat-label">Highest</div></div>
                <div className="di-modal__stat"><div className="di-modal__stat-value">{drillResult.stats.low}</div><div className="di-modal__stat-label">Lowest</div></div>
                <div className="di-modal__stat"><div className="di-modal__stat-value">{drillResult.rows.length}</div><div className="di-modal__stat-label">Records</div></div>
              </div>
            )}

            {drillResult.rows.length === 0 ? (
              <div className="di-empty-charts">No matching records.</div>
            ) : (
              <div className="di-table-wrap di-modal__table">
                <table className="di-table">
                  <thead>
                    <tr>{columns.map(c => <th key={c.name}>{c.name}</th>)}</tr>
                  </thead>
                  <tbody>
                    {drillResult.rows.map((r, i) => (
                      <tr key={i}>
                        {columns.map(c => <td key={c.name}>{String(r[c.name] ?? '')}</td>)}
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

// Build an insightful starter dashboard modeled on the Active Tracking views:
//  • a ranked horizontal bar of the highest-cardinality entity (e.g. people)
//  • a distribution pie of the smallest category (e.g. performance level)
//  • a trend-over-time line when a date column exists
//  • an average-by-category bar (e.g. by quiz / department)
function buildDefaultWidgets(cols, rows) {
  const metric = cols.find(c => c.type === 'numeric')?.name
  const dateCol = cols.find(c => c.type === 'date')?.name
  const dims = cols
    .filter(c => c.type === 'categorical' || c.type === 'text')
    .map(c => ({ name: c.name, card: distinctCount(rows, c.name) }))
    .filter(c => c.card >= 2)
    .sort((a, b) => a.card - b.card) // ascending: small categories first

  const entity = dims[dims.length - 1]?.name // most distinct → the "who"
  const bandCat = dims.find(d => d.card <= 8)?.name // small set → good pie (e.g. level)

  const widgets = []
  let i = 0
  const used = new Set()
  const add = (w) => widgets.push({ id: `w_default_${i++}`, topN: 15, measure: 'count', agg: 'count', ...w })

  // 1. Ranked entity bar — e.g. employees / people by average score
  if (entity) {
    used.add(entity)
    add(metric
      ? { type: 'hbar', dimension: entity, measure: metric, agg: 'avg' }
      : { type: 'hbar', dimension: entity })
  }
  // 2. Score distribution histogram — how the metric is spread
  if (metric) add({ type: 'histogram', measure: metric, agg: 'avg' })
  // 3. Performance band distribution — pie of the smallest category
  if (bandCat) { used.add(bandCat); add({ type: 'pie', dimension: bandCat }) }
  // 4. Trend over time — when there is a date column
  if (dateCol) {
    add(metric
      ? { type: 'line', dimension: dateCol, measure: metric, agg: 'avg' }
      : { type: 'line', dimension: dateCol })
  }
  // 5. Average-by-category for every remaining dimension (org, quiz, dept, …)
  dims
    .filter(d => !used.has(d.name))
    .slice(0, 4)
    .forEach(d => add(metric
      ? { type: 'hbar', dimension: d.name, measure: metric, agg: 'avg' }
      : { type: 'pie', dimension: d.name }))

  return widgets
}

const TOPN_OPTIONS = [10, 15, 25, 50]

// ── Single configurable chart ────────────────────────────────
const ChartWidget = ({ widget, rows, columns, dimensionCols, numericCols, onUpdate, onRemove, onDrill }) => {
  const { type, dimension, measure, agg, topN = 15 } = widget
  const isDate = columns.find(c => c.name === dimension)?.type === 'date'

  // Lift a clicked category/range up to the drill-down modal.
  const drillCategory = (d) => {
    const value = d?.payload?.name ?? d?.name
    if (value != null && onDrill) onDrill({ type: 'category', column: dimension, value })
  }
  const drillRange = (d) => {
    const p = d?.payload ?? d
    if (p && onDrill) onDrill({ type: 'range', column: measure, lo: p.lo, hi: p.hi, label: p.name })
  }

  // Aggregate rows by the dimension; dates are bucketed (by day, or by month
  // once the span is wide) and ordered chronologically, everything else is
  // ranked by value (highest first).
  const fullData = useMemo(() => {
    // Choose date granularity up front so a long history doesn't render a point
    // per day — switch to monthly buckets past ~31 distinct days.
    let byMonth = false
    if (isDate) {
      const days = new Set()
      rows.forEach(r => { const t = parseDate(r[dimension]); if (t != null) days.add(Math.floor(t / 86400000)) })
      byMonth = days.size > 31
    }
    const groups = {}
    rows.forEach(r => {
      let key, ts
      if (isDate) {
        const t = parseDate(r[dimension])
        if (t == null) return
        const d = new Date(t)
        if (byMonth) {
          key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          ts = Date.UTC(d.getFullYear(), d.getMonth(), 1)
        } else {
          key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ts = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
        }
      } else {
        key = (String(r[dimension] ?? '').trim()) || '—'
      }
      if (!groups[key]) groups[key] = { values: [], count: 0, ts }
      groups[key].count += 1
      if (measure !== 'count') {
        const n = toNumber(r[measure])
        if (n !== null) groups[key].values.push(n)
      }
    })
    const arr = Object.entries(groups).map(([name, g]) => {
      let value
      if (measure === 'count') value = g.count
      else if (g.values.length === 0) value = 0
      else if (agg === 'sum') value = g.values.reduce((s, n) => s + n, 0)
      else if (agg === 'min') value = Math.min(...g.values)
      else if (agg === 'max') value = Math.max(...g.values)
      else value = g.values.reduce((s, n) => s + n, 0) / g.values.length
      return { name, value: round1(value), count: g.count, ts: g.ts }
    })
    if (isDate) arr.sort((a, b) => a.ts - b.ts)
    else arr.sort((a, b) => b.value - a.value)
    return arr
  }, [rows, dimension, measure, agg, isDate])

  // Histogram: bucket a numeric column into equal-width ranges (score spread).
  const histData = useMemo(() => {
    if (type !== 'histogram' || measure === 'count') return []
    const nums = rows.map(r => toNumber(r[measure])).filter(n => n !== null)
    if (!nums.length) return []
    const min = Math.min(...nums)
    const max = Math.max(...nums)
    const bins = 10
    const width = (max - min) / bins || 1
    const buckets = Array.from({ length: bins }, (_, i) => ({
      name: `${round1(min + i * width)}–${round1(min + (i + 1) * width)}`,
      value: 0,
      lo: min + i * width,
      hi: min + (i + 1) * width
    }))
    nums.forEach(n => {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor((n - min) / width)))
      buckets[idx].value += 1
    })
    return buckets
  }, [type, measure, rows])

  const isHist = type === 'histogram'
  const isBar = type === 'bar' || type === 'hbar'
  const limitable = isBar && !isDate
  const limit = topN === 'all' ? Infinity : Number(topN)

  const data = useMemo(() => {
    if (limitable) return fullData.slice(0, limit)
    // Pies get a long tail rolled into "Other" (only meaningful for counts)
    if (type === 'pie' && fullData.length > MAX_CHART_CATEGORIES) {
      const head = fullData.slice(0, MAX_CHART_CATEGORIES)
      if (measure === 'count') {
        const tail = fullData.slice(MAX_CHART_CATEGORIES)
        head.push({ name: `Other (${tail.length})`, value: tail.reduce((s, d) => s + d.value, 0) })
      }
      return head
    }
    return fullData
  }, [fullData, limitable, limit, type, measure])

  const view = isHist ? histData : data
  const measureLabel = measure === 'count' ? 'Count' : `${AGG_LABELS[agg]} of ${measure}`
  const titleText = isHist
    ? `Distribution of ${measure}`
    : (isDate ? `${measureLabel} over ${dimension}` : `${measureLabel} by ${dimension}`)
  const showTopN = limitable && fullData.length > TOPN_OPTIONS[0]

  const renderChart = () => {
    if (type === 'hbar') {
      return (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 28, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#727279' }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: '#727279' }} tickFormatter={(v) => (v.length > 20 ? `${v.slice(0, 19)}…` : v)} />
            <Tooltip />
            <Bar dataKey="value" name={measureLabel} radius={[0, 6, 6, 0]} barSize={18} cursor="pointer" onClick={drillCategory}>
              {data.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }
    if (type === 'line') {
      // Cap visible axis labels to ~10 so they never overlap, regardless of point count.
      const tickInterval = data.length > 12 ? Math.ceil(data.length / 10) : 0
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#727279' }} interval={tickInterval} tickMargin={8} minTickGap={16} />
            <YAxis tick={{ fontSize: 12, fill: '#727279' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" name={measureLabel} stroke="#895BF5" strokeWidth={2.5} dot={{ r: 3, fill: '#895BF5' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(d) => `${d.name}: ${d.value}`} cursor="pointer" onClick={drillCategory}>
              {data.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }
    if (type === 'histogram') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barCategoryGap={1}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#727279' }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12, fill: '#727279' }} allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v} record${v === 1 ? '' : 's'}`, 'Records']} />
            <Bar dataKey="value" name="Records" fill="#895BF5" radius={[4, 4, 0, 0]} cursor="pointer" onClick={drillRange} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#727279' }} interval={0} angle={-25} textAnchor="end" height={60} tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)} />
          <YAxis tick={{ fontSize: 12, fill: '#727279' }} />
          <Tooltip />
          <Bar dataKey="value" name={measureLabel} radius={[6, 6, 0, 0]} cursor="pointer" onClick={drillCategory}>
            {data.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="di-chart-card">
      <div className="di-chart-card__head">
        <h3 className="di-chart-card__title">{titleText}</h3>
        <button className="di-chart-card__remove" onClick={() => onRemove(widget.id)} aria-label="Remove chart">
          <CloseIcon />
        </button>
      </div>

      <div className="di-chart-controls">
        <select
          className="di-select"
          value={type}
          onChange={(e) => {
            const t = e.target.value
            // Histogram needs a numeric measure; switch off "count" automatically.
            const patch = { type: t }
            if (t === 'histogram' && measure === 'count') {
              patch.measure = numericCols[0]?.name
              patch.agg = 'avg'
            }
            onUpdate(widget.id, patch)
          }}
        >
          <option value="hbar">Bar (ranked)</option>
          <option value="bar">Bar (column)</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          {numericCols.length > 0 && <option value="histogram">Histogram</option>}
        </select>

        {!isHist && (
          <>
            <span className="di-chart-controls__sep">by</span>
            <select className="di-select" value={dimension} onChange={(e) => onUpdate(widget.id, { dimension: e.target.value })}>
              {dimensionCols.length === 0 && <option value={dimension}>{dimension}</option>}
              {dimensionCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <span className="di-chart-controls__sep">·</span>
          </>
        )}

        <select
          className="di-select"
          value={measure}
          onChange={(e) => {
            const m = e.target.value
            onUpdate(widget.id, { measure: m, agg: m === 'count' ? 'count' : (agg === 'count' ? 'avg' : agg) })
          }}
        >
          {!isHist && <option value="count">Count of rows</option>}
          {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        {measure !== 'count' && !isHist && (
          <select className="di-select" value={agg} onChange={(e) => onUpdate(widget.id, { agg: e.target.value })}>
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>
        )}
        {showTopN && (
          <select className="di-select" value={String(topN)} onChange={(e) => onUpdate(widget.id, { topN: e.target.value })}>
            {TOPN_OPTIONS.filter(n => n < fullData.length).map(n => <option key={n} value={String(n)}>Top {n}</option>)}
            <option value="all">All ({fullData.length})</option>
          </select>
        )}
      </div>

      {view.length === 0
        ? <div className="di-empty-charts">No data for the current filters.</div>
        : (type === 'hbar' ? <div className="di-chart-scroll">{renderChart()}</div> : renderChart())}
    </div>
  )
}

// ── Paginated data table with CSV export ──────────────────────
const DataTable = ({ columns, rows, fileName, anonymized, page, onPage }) => {
  const totalPages = Math.max(1, Math.ceil(rows.length / TABLE_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * TABLE_PAGE_SIZE
  const pageRows = rows.slice(start, start + TABLE_PAGE_SIZE)

  const exportCSV = () => {
    const headers = columns.map(c => c.name)
    const body = rows.map(r => headers.map(h => r[h]))
    const csv = [headers, ...body].map(r => r.map(csvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(fileName || 'data').replace(/\.[^.]+$/, '')}-filtered-${anonymized ? 'company' : 'internal'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="di-panel">
      <div className="di-panel__head">
        <h2><TableChartIcon /> Filtered Data <span className="di-badge">{rows.length}</span></h2>
        <button className="btn btn--outline" onClick={exportCSV} disabled={rows.length === 0}>
          <TableChartIcon className="btn-icon" /> Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="di-empty-charts">No rows match the current filters.</div>
      ) : (
        <>
          <div className="di-table-wrap">
            <table className="di-table">
              <thead>
                <tr>{columns.map(c => <th key={c.name}>{c.name}</th>)}</tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={start + i}>
                    {columns.map(c => <td key={c.name}>{String(r[c.name] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="di-pager">
              <button className="di-link" onClick={() => onPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>Prev</button>
              <span>Page {safePage + 1} of {totalPages}</span>
              <button className="di-link" onClick={() => onPage(Math.min(totalPages - 1, safePage + 1))} disabled={safePage >= totalPages - 1}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DetailedInsights
