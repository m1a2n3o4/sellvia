// Who may open the CRM in production, and whether they get the clean "reviewer" view.
// Env (Vercel): CRM_ENABLED=true, CRM_ALLOWED_TENANTS="id1,id2" (optional), CRM_REVIEW_TENANTS="id3" (optional).
// Reviewer tenants are allowed automatically and see only Inbox + Instagram with their real business name.
export const splitIds = (v?: string) => (v || '').split(',').map((t) => t.trim()).filter(Boolean);
export const reviewTenantIds = () => splitIds(process.env.CRM_REVIEW_TENANTS);
export const isReviewTenant = (tenantId: string | null) => !!tenantId && reviewTenantIds().includes(tenantId);
