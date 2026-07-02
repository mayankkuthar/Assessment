-- ============================================================================
-- HappiMynd RBAC migration
--   Three-tier role model layered on the existing user_roles table:
--     super_admin : Internal HappiMynd team  — full system access & overrides
--     admin       : Client admins (HR / managers) — limited, org-scoped
--     user        : End users — access only the modules assigned at onboarding
--
--   Run AFTER add_user_roles_table.sql. Idempotent where possible.
-- ============================================================================

-- 1. Allow the 'super_admin' role -------------------------------------------
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_role_check
    CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. RBAC columns ------------------------------------------------------------
--    permissions           : dashboard "views" the member may access
--    permissions_locked    : once TRUE, only a Super Admin may change them
--    password_set_by_admin : Admin may set the onboarding password once;
--                            once TRUE, only a Super Admin may reset it
--    created_by            : who provisioned this user
--    organization_id       : org the user belongs to (Admin scope boundary)
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS permissions_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS password_set_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS organization_id UUID;

-- 3. Helper functions --------------------------------------------------------
CREATE OR REPLACE FUNCTION is_super_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = uid AND role = 'super_admin'
    );
$$;

CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = uid AND role IN ('admin', 'super_admin')
    );
$$;

-- Organization an actor belongs to (used for Admin scope checks).
CREATE OR REPLACE FUNCTION actor_org(uid UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT organization_id FROM user_roles WHERE user_id = uid;
$$;

-- 4. Row-level security: enforce the Admin limitations -----------------------
-- Replace the broad "FOR ALL" admin policy with granular policies so Admins can
-- VIEW and ADD users (regular users, in their own org) and complete the one-time
-- initial setup, but CANNOT delete users or change locked permissions/roles —
-- those are reserved for Super Admin.
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- View: Super Admin sees all; Admin sees users in their organization.
CREATE POLICY "Admins can view roles in scope" ON user_roles
    FOR SELECT USING (
        is_super_admin(auth.uid())
        OR (is_admin(auth.uid()) AND organization_id IS NOT DISTINCT FROM actor_org(auth.uid()))
        OR user_id = auth.uid()
    );

-- Add users: Admins may add regular users in their own org; Super Admins anyone.
CREATE POLICY "Admins can add users" ON user_roles
    FOR INSERT WITH CHECK (
        is_super_admin(auth.uid())
        OR (
            is_admin(auth.uid())
            AND role = 'user'
            AND organization_id IS NOT DISTINCT FROM actor_org(auth.uid())
        )
    );

-- Update: Super Admin may update anything; an Admin may only complete the
-- one-time initial setup (while permissions are still unlocked) within their org.
CREATE POLICY "Update roles in scope" ON user_roles
    FOR UPDATE USING (
        is_super_admin(auth.uid())
        OR (
            is_admin(auth.uid())
            AND permissions_locked = FALSE
            AND organization_id IS NOT DISTINCT FROM actor_org(auth.uid())
        )
    );

-- Delete: Super Admin only — Admins must route removals to HappiMynd.
CREATE POLICY "Super admin can delete users" ON user_roles
    FOR DELETE USING (is_super_admin(auth.uid()));

-- 5. Audit log of permission-related actions --------------------------------
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,            -- e.g. user.create, user.delete, password.reset, permissions.update
    target_user_id UUID,
    target_email TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON permission_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON permission_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON permission_audit_log(created_at);

ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Only Super Admins may read the audit log.
DROP POLICY IF EXISTS "Super admin can read audit log" ON permission_audit_log;
CREATE POLICY "Super admin can read audit log" ON permission_audit_log
    FOR SELECT USING (is_super_admin(auth.uid()));

-- Inserts are performed by the backend (service role) — no public insert policy.

-- 6. Seed the generic Super Admin -------------------------------------------
-- The Super Admin account must already exist in auth.users. Replace the email
-- below if you provisioned a different one (see MIGRATION_SUMMARY.md).
INSERT INTO user_roles (user_id, role, email, permissions, permissions_locked)
SELECT u.id, 'super_admin', u.email, '[]'::jsonb, TRUE
FROM auth.users u
WHERE u.email = 'superadmin@happimynd.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
