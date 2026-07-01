// CRM module permission namespace. Registered here alongside the module so
// later phases (or the marketplace) can discover a module's permissions from
// its own package rather than a central list.
export const CRM_PERMISSIONS = {
  CONTACT_READ: "crm.contact.read",
  CONTACT_WRITE: "crm.contact.write",
  LEAD_READ: "crm.lead.read",
  LEAD_WRITE: "crm.lead.write",
  DEAL_READ: "crm.deal.read",
  DEAL_WRITE: "crm.deal.write",
} as const;
