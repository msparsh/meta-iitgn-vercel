import { prisma } from '../lib/prisma.js';

async function seed() {
  console.log("Seeding news pages...");

  // 1. Clean up legacy news pages from live_pages table
  const deletedLivePages = await prisma.live_pages.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: 'news-' } },
        {
          OR: [
            { metadata: { path: ['category'], equals: 'news' } },
            { metadata: { path: ['category'], equals: 'News' } }
          ]
        }
      ]
    }
  });
  console.log(`Cleaned up ${deletedLivePages.count} legacy news pages from live_pages table.`);

  // 2. Define the news articles to seed
  const newsItems = [
    {
      title: "Amalthea 2026 Sets Attendance Record",
      slug: "news-amalthea-attendance-2026",
      content: "Annual Technical Fest Amalthea sets record attendance with winter theme. Over 5,000 students visited the tech showcases and design competitions.",
      video_url: null,
    },
    {
      title: "Sustainable Energy Research Hub Inaugurated",
      slug: "news-sustainable-energy-hub",
      content: "A new Sustainable Energy & Carbon Neutrality Research Hub was inaugurated at the Palaj campus today, focusing on solar materials and next-generation battery architectures.",
      video_url: null,
    },
    {
      title: "Winter Campus Hackathon Announced",
      slug: "news-winter-hackathon-announced",
      content: "The Technical Council has officially announced the upcoming Winter Campus Hackathon starting next week. The prize pool is set at 1,00,000 INR.",
      video_url: null,
    }
  ];

  // 3. Upsert into news table
  for (const item of newsItems) {
    const news = await prisma.news.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        video_url: item.video_url,
      },
      create: {
        title: item.title,
        slug: item.slug,
        content: item.content,
        video_url: item.video_url,
      }
    });
    console.log(`Upserted news item: ${news.slug}`);
  }

  console.log("Seeding finished successfully.");
}

seed()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
