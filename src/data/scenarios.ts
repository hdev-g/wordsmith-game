// src/data/scenarios.ts

import { Scenario } from '@/types/game';
  
export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "The Hostile Takeover",
    complexity: "High Stakes",
    stakes: "Critical",
    description: "Apex Capital, a notorious corporate raider, has launched a surprise hostile takeover bid for your client's company. They're offering a 30% premium over current market value, but your client believes this severely undervalues their growth potential.",
    plaintiffPosition: "Apex Capital argues the offer is more than generous and that current management is entrenched and resistant to shareholder interests. They've already secured commitments from several institutional investors.",
    defensePosition: "Your client has a strong growth strategy and believes Apex will strip the company for parts, destroying long-term value. The board needs time to explore strategic alternatives.",
    context: {
      keyIssues: [
        "Corporate control",
        "Shareholder rights",
        "Board fiduciary duties",
        "Tender offer defense"
      ],
      stakeholders: [
        "Board of Directors",
        "Apex Capital",
        "Shareholders",
        "Employees"
      ],
      legalDomain: "Corporate Law",
      constraints: [
        "Time pressure - tender offer expires in 48 hours",
        "Limited financial resources",
        "Complex regulatory requirements",
        "Shareholder approval needed"
      ]
    },
    defensiveStrategies: {
      low: {
        name: "Rally the Shareholders",
        description: ["Get major investors on your side"],
        riskScore: 4,
        risk: "LOW",
        reward: "Slow but steady defense"
      },
      medium: {
        name: "Poison Pill Defense",
        description: ["Deploy shareholder rights plan"],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Force better deal terms"
      },
      high: {
        name: "White Knight Gambit",
        description: ["Find friendly buyer with deep pockets"],
        riskScore: 8,
        risk: "HIGH",
        reward: "Total takeover defense"
      }
    },
    logicRound: {
      prompt: "Present your initial defensive strategy against Apex Capital's hostile takeover attempt. Consider shareholder interests, corporate governance, and long-term value preservation."
    }
  },
  {
    id: 2,
    title: "The Trade Secret Heist",
    complexity: "Technical",
    stakes: "High",
    description: "OmniWare, your client, has discovered that their former VP of Engineering took proprietary AI algorithms to their main competitor. Early evidence suggests the competitor is already implementing the stolen technology.",
    plaintiffPosition: "The competitor claims any similarities in their AI implementation are coincidental and based on common industry practices. They argue the former VP signed no specific IP agreements.",
    defensePosition: "Your client has clear documentation of their trade secrets and evidence of unusual data downloads before the VP's departure. The technology represents years of R&D investment.",
    context: {
      keyIssues: [
        "Trade secret misappropriation",
        "Non-compete enforcement",
        "Evidence preservation",
        "Emergency injunctive relief"
      ],
      stakeholders: [
        "OmniWare",
        "Former VP",
        "Competitor company",
        "Current employees"
      ],
      legalDomain: "Intellectual Property Law",
      constraints: [
        "Limited time to gather evidence",
        "Technical complexity of the code",
        "Jurisdictional issues",
        "Potential reputational damage"
      ]
    },
    defensiveStrategies: {
      low: {
        name: "Quick Legal Strike",
        description: ["Get emergency court order"],
        riskScore: 3,
        risk: "LOW",
        reward: "Stop the bleeding"
      },
      medium: {
        name: "Digital Detective",
        description: ["Track stolen code usage"],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Catch them red-handed"
      },
      high: {
        name: "Public Pressure Campaign",
        description: ["Expose theft to media"],
        riskScore: 9,
        risk: "HIGH",
        reward: "Total industry knockout"
      }
    },
    logicRound: {
      prompt: "Outline your strategy to protect OmniWare's trade secrets and prevent further damage. Consider immediate legal actions, evidence gathering, and long-term protective measures."
    }
  },
  {
    id: 3,
    title: "The Merger Challenge",
    complexity: "Regulatory",
    stakes: "Critical",
    description: "The FTC has announced its intention to block your client's $50 billion merger with their largest competitor. They claim the deal would create a monopoly and harm consumer interests.",
    plaintiffPosition: "The FTC argues the merger would reduce competition, lead to higher prices, and stifle innovation in a critical market sector. They have substantial economic data supporting their position.",
    defensePosition: "Your client believes the merger will create efficiencies that benefit consumers and is necessary to compete with international rivals. They've already invested heavily in integration planning.",
    context: {
      keyIssues: [
        "Antitrust compliance",
        "Merger defense",
        "Regulatory negotiations",
        "Document preservation"
      ],
      stakeholders: [
        "FTC regulators",
        "Company shareholders",
        "Industry competitors",
        "Consumers"
      ],
      legalDomain: "Antitrust Law",
      constraints: [
        "Strict regulatory deadlines",
        "Complex market analysis required",
        "Multiple stakeholder interests",
        "Public health considerations"
      ]
    },
    defensiveStrategies: {
      low: {
        name: "Play Nice with FTC",
        description: ["Cooperate with investigation"],
        riskScore: 4,
        risk: "LOW",
        reward: "Dodge major penalties"
      },
      medium: {
        name: "Strategic Sacrifice",
        description: ["Show merger benefits data"],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Save the big money"
      },
      high: {
        name: "All-Out Legal War",
        description: ["Challenge FTC in court"],
        riskScore: 8,
        risk: "HIGH",
        reward: "Keep everything"
      }
    },
    logicRound: {
      prompt: "Detail your approach to defending the merger against FTC scrutiny. Consider regulatory compliance, market analysis, and potential remedies that preserve deal value."
    }
  }
];