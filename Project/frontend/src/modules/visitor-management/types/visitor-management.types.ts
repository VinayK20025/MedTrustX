export interface Visitor {
  id: string;
  name: string;
  id_type: string;
  id_value: string;
}

export interface Visit {
  id: string;
  visitor_id: string;
  host_id: string;
  purpose: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
}

export interface VisitorBadge {
  id: string;
  visit_id: string;
  badge_code: string;
  status: string;
  issued_at: string;
}

export interface VisitLog {
  id: string;
  visit_id: string;
  event_type: string;
}
