import React from 'react';
import { getCurrentRole } from '../services/rbac.js';

// Conditionally render children based on allowed roles.
//   <RoleGuard allow={['super_admin']}>...</RoleGuard>
// Capability checks, role helpers and the permission matrix live in
// ../services/rbac.js (the server enforces the same rules authoritatively).
export function RoleGuard({ allow = [], children, fallback = null }) {
  const role = getCurrentRole();
  return allow.includes(role) ? <>{children}</> : fallback;
}

export default RoleGuard;
