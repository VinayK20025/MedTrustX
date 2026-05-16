export interface Litigation {
  id: string;
  case_id: string;
  court_name: string;
  status: string;
  filed_at: string;
}

export interface Hearing {
  id: string;
  litigation_id: string;
  hearing_date: string;
  status: string;
  notes: string | null;
}

export interface LegalParty {
  id: string;
  litigation_id: string;
  party_name: string;
  role: string;
}

export interface LitigationUpdate {
  id: string;
  litigation_id: string;
  update_type: string;
  details: Record<string, any>;
}
