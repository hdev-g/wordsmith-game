export interface PlayerStats {
  logic: number;
  charisma: number;
  risk: number;
}

export interface PlayerData {
  name: string;
  motto: string;
  stats: PlayerStats;
} 