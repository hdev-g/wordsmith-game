import { PrismaClient, Score } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all users
  const users = await prisma.user.findMany({
    include: {
      scores: true
    }
  });
  console.log('Users:', users);

  // Get all scores
  const scores = await prisma.score.findMany({
    include: {
      user: true
    }
  });
  console.log('Scores:', scores);

  // Get average score
  const allScores = await prisma.score.findMany();
  const avgScore = allScores.reduce((acc: number, curr: Score) => acc + curr.score, 0) / allScores.length || 0;
  console.log('Average Score:', avgScore);

  // Get success rate
  const successRate = (allScores.filter((s: Score) => s.outcome === 'successful defense').length / allScores.length) * 100 || 0;
  console.log('Success Rate:', successRate + '%');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 