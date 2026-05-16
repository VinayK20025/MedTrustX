export interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
}

export interface ReportSection {
  id: string;
  report_id: string;
  section_name: string;
  content: Record<string, any>;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  frequency: string;
  next_run: string;
}

export interface ReportDistribution {
  id: string;
  report_id: string;
  recipient_id: string;
  status: string;
  sent_at: string | null;
}
