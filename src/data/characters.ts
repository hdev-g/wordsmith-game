// src/data/characters.ts
import { Character } from '@/types/game';

export const characters: Character[] = [
  {
    id: 'harvey-spector',
    name: "Harvey Spector",
    pseudonym: "The Closer",
    image: "/images/hs.png",
    quote: "I don't play the odds, I play the man.",
    openingStatement: "this case isn't just about the law—it's about power, strategy, and knowing when to strike. My client's position is unassailable, and I'll prove it.",
    stats: {
      logic: 9,    // Strong logical reasoning
      charisma: 8, // Excellent but not overpowering charisma
      risk: 7      // Calculated risk-taker
    }
  },
  {
    id: 'saul-goodman',
    name: "Saul Goodman",
    pseudonym: "The Silver Tongue",
    image: "/images/sg.png",
    quote: "I'm every lawyer's nightmare: cheap, fast—and right.",
    openingStatement: "ladies and gentlemen, what we have here is a classic case of misunderstanding. By the time I'm done, you'll see that my client is not only innocent but deserves compensation for this ordeal.",
    stats: {
      logic: 6,     // Clever but sometimes bends logic
      charisma: 9,  // Extremely persuasive
      risk: 9       // High-risk strategies
    }
  },
  {
    id: 'kim-kardashian',
    name: "Kim Kardashian",
    pseudonym: "The Influencer",
    image: "/images/kk.png",
    quote: "I'm not just a celebrity—I'm fighting for justice.",
    openingStatement: "this case represents everything wrong with our justice system. Through careful research and dedication, I will demonstrate why reform is needed and why my client deserves a second chance.",
    stats: {
      logic: 7,     // Solid research and preparation
      charisma: 10, // Celebrity influence and media savvy
      risk: 7       // Strategic risk-taking
    }
  },
  {
    id: 'elle-woods',
    name: "Elle Woods",
    pseudonym: "The Natural",
    image: "/images/legally-blonde.png",
    quote: "What, like it's hard? I studied for this judgment.",
    openingStatement: "your Honor, while some may underestimate the complexity of this case, I assure you that the facts speak for themselves. Through thorough preparation and attention to detail, we will prove our case.",
    stats: {
      logic: 8,     // Strong academic performance
      charisma: 9,  // Natural charm and authenticity
      risk: 7       // Innovative but grounded approach
    }
  }
];