export interface EvidenceItem {
  id: string;
  case_id: string;
  type: string;
  file_path: string;
  hash: string;
}

export interface CustodyLog {
  id: string;
  evidence_id: string;
  action: string;
  performed_by: string;
  timestamp: string;
}

export interface EvidenceMetadata {
  id: string;
  evidence_id: string;
  metadata_json: Record<string, any>;
}

export interface AccessRecord {
  id: string;
  evidence_id: string;
  user_id: string;
  action: string;
}
