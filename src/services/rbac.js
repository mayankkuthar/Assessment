// ---------------------------------------------------------------------------
// RBAC helpers for the UI. These MIRROR the server-side rules in
// server-auth-test.js — the server remains the source of truth and will reject
// unauthorized calls; these helpers just let us hide/disable controls and show
// a clear message before the user attempts a restricted action.
// ---------------------------------------------------------------------------

export const ROLES = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin', USER: 'user' };

const ROUTE_TO_SUPER_ADMIN = 'Only Super Admin (HappiMynd) can perform this action.';

// Read the logged-in user the same way App.jsx does.
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function getCurrentRole() {
  return getCurrentUser()?.role || null;
}

export const isSuperAdmin = (role = getCurrentRole()) => role === ROLES.SUPER_ADMIN;
export const isAdmin = (role = getCurrentRole()) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

// Capability matrix. Returns { allowed, message } so callers can disable a
// control and surface the reason. `target` (optional) carries the affected
// user so we can encode the Admin "once only" rules.
//   - delete_user        : Super Admin only
//   - reset_password     : Super Admin any time; Admin only the one-time
//                          onboarding set (target.password_set_by_admin === false)
//   - modify_permissions : Super Admin any time; Admin only while unlocked
//   - add_user           : Admin or Super Admin
//   - manage_org         : Super Admin only
//   - view_audit_log     : Super Admin only
export function can(action, { role = getCurrentRole(), target = null } = {}) {
  const superAdmin = isSuperAdmin(role);
  const admin = isAdmin(role);

  switch (action) {
    case 'delete_user':
      return superAdmin
        ? { allowed: true }
        : { allowed: false, message: 'Admins cannot remove users. Removal requests must be routed to Super Admin (HappiMynd).' };

    case 'reset_password':
      if (superAdmin) return { allowed: true };
      if (admin && target && target.password_set_by_admin === false) return { allowed: true };
      return { allowed: false, message: 'Password resets must be handled by Super Admin (HappiMynd).' };

    case 'modify_permissions':
      if (superAdmin) return { allowed: true };
      if (admin && target && target.permissions_locked === false) return { allowed: true };
      return { allowed: false, message: 'Permissions are locked after initial setup. Changes require Super Admin approval.' };

    case 'add_user':
      return admin ? { allowed: true } : { allowed: false, message: ROUTE_TO_SUPER_ADMIN };

    case 'manage_org':
      return superAdmin
        ? { allowed: true }
        : { allowed: false, message: 'Organization management is restricted to Super Admin (HappiMynd).' };

    case 'view_audit_log':
      return superAdmin ? { allowed: true } : { allowed: false, message: ROUTE_TO_SUPER_ADMIN };

    default:
      return { allowed: false, message: ROUTE_TO_SUPER_ADMIN };
  }
}

// Convenience wrapper for components (no React state — safe in any module).
export function useCan(action, opts) {
  return can(action, opts);
}
