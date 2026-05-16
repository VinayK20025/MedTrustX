export interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  authorId: string;
  authorName: string;
  role: string;
  type: 'soap' | 'progress' | 'consult' | 'discharge' | 'quick';
  content: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    freeText?: string;
  };
  timestamp: string;
  status: 'draft' | 'signed' | 'amended';
}

export interface ClinicalFilters {
  patientId?: string;
  type?: string;
  status?: string;
  dateRange?: [string, string];
}
