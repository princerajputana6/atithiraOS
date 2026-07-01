export { PEOPLE_PERMISSIONS } from "./permissions";
export {
  getEmployeeRepository,
  getAttendanceRepository,
  getLeaveRepository,
  getSalaryStructureRepository,
  getPayslipRepository,
} from "./repositories";
export {
  createEmployee,
  listEmployees,
  markAttendance,
  listAttendance,
  requestLeave,
  listLeave,
  decideLeave,
  type CreateEmployeeInput,
  type MarkAttendanceInput,
  type RequestLeaveInput,
} from "./services";
export {
  setSalaryStructure,
  getSalaryStructure,
  generatePayslip,
  listPayslips,
  markPayslipPaid,
  type SetSalaryStructureInput,
} from "./payroll-service";
import "./reports";
