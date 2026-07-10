// Canonical display order for user profiles. Used anywhere profiles are listed
// (registration dropdown, report/results filters, admin breakdowns) so the
// sequence stays consistent across the app.
//
// Matching is done case- and spacing-insensitively, so variants like
// "Student(school)" / "Student (School)" all map to the same slot.
export const PROFILE_ORDER = [
  'Salaried',
  'Frontline Warrior',
  'Student(College/University)',
  'Student(School)',
  'Senior Citizen',
  'Entrepreneur',
  'Working Woman',
  'Jobseeker',
  'Self Employed',
]

const normalize = (name) =>
  (name || '').toString().toLowerCase().replace(/\s+/g, '')

const ORDER_INDEX = PROFILE_ORDER.reduce((acc, name, i) => {
  acc[normalize(name)] = i
  return acc
}, {})

// Rank for a profile name — listed profiles sort in PROFILE_ORDER; anything
// else (e.g. "Home Maker") falls after them while keeping its relative order.
export const profileRank = (name) => {
  const idx = ORDER_INDEX[normalize(name)]
  return idx === undefined ? PROFILE_ORDER.length : idx
}

// True when two profile names refer to the same profile, ignoring case and
// spacing (e.g. "Student(College/University)" === "Student (college/university)").
export const isSameProfile = (a, b) => normalize(a) === normalize(b)

// Whether a profile name is one of the canonical listed profiles.
export const isCanonicalProfile = (name) =>
  ORDER_INDEX[normalize(name)] !== undefined

// Stable-sort a list of profiles by the canonical order.
// `getName` extracts the display name (defaults to `p.name`).
export const sortProfiles = (profiles, getName = (p) => p?.name) =>
  [...(profiles || [])]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const r = profileRank(getName(a.p)) - profileRank(getName(b.p))
      return r !== 0 ? r : a.i - b.i
    })
    .map(({ p }) => p)
