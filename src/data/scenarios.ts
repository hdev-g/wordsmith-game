// src/data/scenarios.ts

import { Scenario } from '@/types/game';
  
  export const scenarios: Scenario[] = [
    {
    id: 1,
    title: "Boardroom Blitz",
    description: "A high-stakes battle for corporate control as Apex Capital launches an aggressive hostile takeover bid for TitanTech.",
    plaintiffPosition: "Apex Capital claims TitanTech is undervalued and poorly managed, seeking to acquire control through a tender offer below market value to 'unlock shareholder value' and 'optimize operations'.",
    defensePosition: "As TitanTech's General Counsel, you must protect the company's independence, preserve its innovative culture, and prevent the stripping of valuable intellectual property.",
    stakes: "Very High",
    complexity: "Strategic",
    context: {
      keyIssues: [
        "Corporate control",
        "Shareholder rights",
        "Board fiduciary duties",
        "Tender offer defense"
      ],
      stakeholders: [
        "TitanTech Board",
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
        description: [
          "Get major investors on your side",
          "Block hostile tender offer",
          "Keep it friendly and professional"
        ],
        riskScore: 4,
        risk: "LOW",
        reward: "Slow but steady defense"
      },
      medium: {
        name: "Poison Pill Defense",
        description: [
          "Deploy shareholder rights plan",
          "Install staggered board terms",
          "Trigger antitrust review"
        ],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Force better deal terms"
      },
      high: {
        name: "White Knight Gambit",
        description: [
          "Find friendly buyer with deep pockets",
          "Launch emergency buyback plan",
          "Double the company's value overnight"
        ],
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
    title: "Inside Job",
    description: "A critical case of trade secret theft and corporate espionage threatening OmniWare's competitive advantage.",
    plaintiffPosition: "The competitor company claims they legitimately developed similar technology and the former engineer did not violate any agreements.",
    defensePosition: "As OmniWare's counsel, you must prove trade secret misappropriation, enforce non-compete agreements, and protect your company's intellectual property.",
    stakes: "High",
    complexity: "Technical",
    context: {
      keyIssues: [
        "Trade secret misappropriation",
        "Non-compete enforcement",
        "Evidence preservation",
        "Emergency injunctive relief"
      ],
      stakeholders: [
        "OmniWare",
        "Former engineer",
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
        description: [
          "Get emergency court order",
          "Lock down all evidence",
          "Send cease & desist letter"
        ],
        riskScore: 3,
        risk: "LOW",
        reward: "Stop the bleeding"
      },
      medium: {
        name: "Digital Detective",
        description: [
          "Track stolen code usage",
          "Force discovery of evidence",
          "Monitor competitor's moves"
        ],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Catch them red-handed"
      },
      high: {
        name: "Public Pressure Campaign",
        description: [
          "Expose theft to media",
          "Push for criminal charges",
          "Make them sweat in public"
        ],
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
    title: "Regulatory Showdown",
    description: "A high-stakes antitrust investigation threatening to unwind Horizon Pharmaceuticals' merger with HealthCorp.",
    plaintiffPosition: "The FTC alleges the merger has created monopolistic pricing power over a critical drug, demanding divestiture or significant operational restrictions.",
    defensePosition: "As Horizon's Corporate Counsel, you must defend the merger's consumer benefits, manage the investigation process, and protect shareholder value.",
    stakes: "Critical",
    complexity: "Complex",
    context: {
      keyIssues: [
        "Antitrust compliance",
        "Merger defense",
        "Regulatory negotiations",
        "Document preservation"
      ],
      stakeholders: [
        "FTC regulators",
        "Horizon shareholders",
        "Healthcare providers",
        "Patients"
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
        description: [
          "Cooperate with investigation",
          "Offer small concessions",
          "Keep everything friendly"
        ],
        riskScore: 4,
        risk: "LOW",
        reward: "Dodge major penalties"
      },
      medium: {
        name: "Strategic Sacrifice",
        description: [
          "Show merger benefits data",
          "Offer to sell minor assets",
          "Keep the core business safe"
        ],
        riskScore: 6,
        risk: "MEDIUM",
        reward: "Save the big money"
      },
      high: {
        name: "All-Out Legal War",
        description: [
          "Challenge FTC in court",
          "Launch PR blitz",
          "Fight for total victory"
        ],
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