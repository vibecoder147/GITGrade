export interface LanguageStat {
  name: string;
  value: number;
}

export interface AuditRequest {
  repoName: string;
  fileTree: string;
  fileContents: string;
  languageDistribution: LanguageStat[];
}

export interface AuditResponse {
  markdown: string;
  score: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  FETCHING_REPO = 'FETCHING_REPO',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
