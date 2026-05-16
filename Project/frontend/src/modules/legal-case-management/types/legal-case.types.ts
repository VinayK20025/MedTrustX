export interface LegalCase {
  id: string;
  case_number: string;
  type: string;
  status: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  document_type: string;
  file_path: string;
}

export interface CaseTask {
  id: string;
  case_id: string;
  task_name: string;
  status: string;
  assigned_to: string;
}

export interface ComplianceRecord {
  id: string;
  case_id: string;
  regulation: string;
  status: string;
}
