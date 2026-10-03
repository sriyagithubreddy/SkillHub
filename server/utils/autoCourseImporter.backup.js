require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const SEARCHES = [
  { query: 'Python programming full course beginners', category: 'Programming', level: 'Beginner' },
  { query: 'DSA data structures algorithms Python', category: 'Programming', level: 'Intermediate' },
  { query: 'SQL database course beginners', category: 'Database', level: 'Beginner' },
  { query: 'data science Python course', category: 'Data Science', level: 'Beginner' },
  { query: 'machine learning Python course', category: 'Machine Learning', level: 'Intermediate' },
  { query: 'artificial intelligence course Python', category: 'Artificial Intelligence', level: 'Intermediate' },
  { query: 'deep learning neural networks course', category: 'Artificial Intelligence', level: 'Advanced' },
  { query: 'React JavaScript full course', category: 'Web Development', level: 'Beginner' },
  { query: 'Node.js Express course', category: 'Web Development', level: 'Intermediate' },
  { query: 'cyber security course beginners', category: 'Cyber Security', level: 'Beginner' },
  { query: 'AWS cloud computing course', category: 'Cloud Computing', level: 'Beginner' },
  { query: 'Power BI data analytics course', category: 'Data Science', level: 'Beginner' }
];

function getLevel(title, defaultLevel) {
  const text = title.toLowerCase();

  if (
    text.includes('advanced') ||
    text.includes('expert') ||
    text.includes('deep dive')
  ) {
    return 'Advanced';
  }

  if (
    text.includes('intermediate') ||
    text.includes('master') ||
    text.includes('complete')
  ) {
    return 'Intermediate';
  }

  return defaultLevel;
}

function estimateDurationHours(title) {
  const text = title.toLowerCase();

  if (text.includes('short') || text.includes('quick')) return 2;
  if (text.includes('full course')) return 10;
  if (text.includes('bootcamp')) return 20;

  return 6;
}

function buildSkills(category, title) {
  const text = title.toLowerCase();
  const skills = [];

  const add = (skill) => {
    if (!skills.includes(skill)) skills.push(skill);
  };

  if (text.includes('python')) add('Python');
  if (text.includes('sql')) add('SQL');
  if (text.includes('javascript')) add('JavaScript');
  if (text.includes('react')) add('React');
  if (text.includes('node')) add('Node.js');
  if (text.includes('machine learning')) add('Machine Learning');
  if (text.includes('deep learning')) add('Deep Learning');
  if (text.includes('neural network')) add('Neural Networks');
  if (text.includes('data science')) add('Data Science');
  if (text.includes('power bi')) add('Power BI');
  if (text.includes('aws')) add('AWS');
  if (text.includes('cloud')) add('Cloud Computing');
  if (text.includes('cyber')) add('Cybersecurity');
  if (text.includes('algorithm')) add('Algorithms');
  if (text.includes('data structure')) add('Data Structures');

  if (!skills.length) {
    add(category);
  }

  return skills.slice(0, 8);
}

async function searchYouTube(query) {
  const url = new URL(
    'https://www.googleapis.com/youtube/v3/search'
  );

  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '10');
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('key', YOUTUBE_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube API ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

async function importCourses() {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is missing from .env');
  }

  await connectDB();

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const search of SEARCHES) {
    console.log(`\nSearching: ${search.query}`);

    let data;

    try {
      data = await searchYouTube(search.query);
    } catch (error) {
      console.error(`Search failed: ${error.message}`);
      continue;
    }

    for (const item of data.items || []) {
      const videoId = item.id?.videoId;

      if (!videoId) {
        skipped++;
        continue;
      }

      const title = item.snippet?.title?.trim();

      if (!title) {
        skipped++;
        continue;
      }

      const description =
        item.snippet?.description?.trim() ||
        `YouTube learning resource for ${search.category}.`;

      const channelTitle =
        item.snippet?.channelTitle || 'YouTube Creator';

      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      const courseData = {
        title,
        description: description.slice(0, 1000),
        platform: 'YouTube',
        instructor: channelTitle,
        category: search.category,
        skills: buildSkills(search.category, title),
        level: getLevel(title, search.level),
        durationHours: estimateDurationHours(title),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        free: true,
        rating: 0,
        popularity: 0,
        thumbnail,
        status: 'active',
        lastChecked: new Date(),
        source: 'external_api'
      };

      const existing = await Course.findOne({
        platform: 'YouTube',
        url: courseData.url
      });

      if (existing) {
        await Course.updateOne(
          { _id: existing._id },
          { $set: courseData }
        );

        updated++;
      } else {
        await Course.create(courseData);
        added++;
      }
    }
  }

  console.log('\n======================================');
  console.log('SkillHub automatic course import done');
  console.log('======================================');
  console.log(`New courses added: ${added}`);
  console.log(`Existing courses updated: ${updated}`);
  console.log(`Skipped results: ${skipped}`);
  console.log('======================================');

  await mongoose.connection.close();
}

importCourses().catch(async (error) => {
  console.error('\nAutomatic course import failed:');
  console.error(error.message);

  try {
    await mongoose.connection.close();
  } catch {}

  process.exit(1);
});