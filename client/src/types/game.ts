export interface VotekickState {
  targetId: string;
  targetName: string;
  yes: number;
  no: number;
  total: number;
  status: 'ongoing' | 'passed' | 'failed';
}
