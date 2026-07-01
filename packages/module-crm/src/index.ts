export { CRM_PERMISSIONS } from "./permissions";
export {
  ContactRepository,
  LeadRepository,
  DealRepository,
  getContactRepository,
  getLeadRepository,
  getDealRepository,
} from "./repositories";
export {
  createContact,
  listContacts,
  createLead,
  listLeads,
  createDeal,
  listDeals,
  moveDeal,
  type CreateContactInput,
  type CreateLeadInput,
  type CreateDealInput,
} from "./services";
import "./reports";
