export interface DefensiveStrategy {
  name: string;
  description: string[];
  riskScore: number;
  risk: string;
  reward: string;
}

export interface RoundOptions {
  best: {
    text: string;
    explanation: string;
  };
  middle: {
    text: string;
    explanation: string;
  };
  worst: {
    text: string;
    explanation: string;
  };
}

export interface RiskOption {
  description: string;
  details: string;
  riskScore: number;
  risk: string;
  reward: string;
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  plaintiffPosition: string;
  defensePosition: string;
  stakes: string;
  complexity: string;
  context: {
    keyIssues: string[];
    stakeholders: string[];
  };
  defensiveStrategies: {
    low: DefensiveStrategy;
    medium: DefensiveStrategy;
    high: DefensiveStrategy;
  };
}

export interface Character {
  id: string;
  name: string;
  pseudonym: string;
  image: string;   // e.g. "/images/character_placeholder.png"
  quote: string;
  openingStatement: string;
  stats: {
    logic: number;
    charisma: number;
    risk: number;
  };
} 