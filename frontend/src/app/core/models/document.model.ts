export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  description?: string;
  category?: string;
  jobId?: string;
  jobName?: string;
  contactId?: string;
  contactName?: string;
  uploadedBy: string;
  createdAt: string;
}

export const DOCUMENT_CATEGORIES = [
  'Tax Return',
  'W-2',
  'Form 1099',
  'Receipt',
  'Bank Statement',
  'Financial Statement',
  'Contract',
  'Other'
];
