export interface PlayerStats {
  logic: number;
  charisma: number;
  risk: number;
}

export interface PlayerData {
  id?: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  stats?: PlayerStats;
} 