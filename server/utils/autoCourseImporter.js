require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const {
  filterCourse
} = require('./courseDomainFilter');

const YOUTUBE_API_KEY =
  process.env.YOUTUBE_API_KEY;

const SEARCHES = [
  'Python programming full course beginners',
  'DSA data structures algorithms Python',
  'SQL database course beginners',
  'data science Python course',
  'machine learning Python course',
  'artificial intelligence course Python',
  'deep learning neural networks course',
  'React JavaScript full course',
  'Node.js Express course',
  'cyber security course beginners',
  'AWS cloud computing course',
  'Power BI data analytics course'
];

/*
 * YouTube-specific quality filter.
 *
 * SkillHub is a learning-course platform, so we
 * reject obvious roadmap/career/shorts/exam videos
 * while keeping genuine tutorials and courses.
 */
function isQualityCourse(title, description = '') {
  const text =
    `${title} ${description}`.toLowerCase();

  const rejectedPatterns = [
    /#shorts\b/i,
    /\broadmap\b/i,
    /\bcareer (path|guide|scope)\b/i,
    /\bhow to become\b/i,
    /\bplacement tips\b/i,
    /\binterview tips\b/i,
    /\binterview preparation\b/i,
    /\bpass the exam\b/i,
    /\bcertification (guide|tips|exam)\b/i
  ];

  if (
    rejectedPatterns.some(
      pattern => pattern.test(text)
    )
  ) {
    return false;
  }

  /*
   * Reject very short "What is X?" videos.
   */
  if (
    /\bwhat is\b/i.test(title) &&
    (
      /\bin\s+\d+\s+minutes?\b/i.test(title) ||
      /\b\d+\s+minutes?\b/i.test(title)
    )
  ) {
    return false;
  }

  /*
   * Reject short standalone explanations such as
   * "AWS in 5 minutes", but keep full courses/tutorials.
   */
  if (
    /\bin\s+\d+\s+minutes?\b/i.test(title) &&
    !/\bfull course\b|\bcomplete course\b|\btutorial\b/i.test(title)
  ) {
    return false;
  }

  return true;
}

function getLevel(title) {
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

  return 'Beginner';
}

function estimateDurationHours(title) {
  const text = title.toLowerCase();

  if (
    text.includes('short') ||
    text.includes('quick')
  ) {
    return 2;
  }

  if (text.includes('full course')) {
    return 10;
  }

  if (text.includes('bootcamp')) {
    return 20;
  }

  return 6;
}

function buildSkills(category, title) {
  const text = title.toLowerCase();
  const skills = [];

  const add = skill => {
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  };

  if (text.includes('python')) add('Python');
  if (text.includes('sql')) add('SQL');
  if (text.includes('javascript')) add('JavaScript');
  if (text.includes('react')) add('React');
  if (text.includes('node')) add('Node.js');

  if (text.includes('machine learning')) {
    add('Machine Learning');
  }

  if (text.includes('deep learning')) {
    add('Deep Learning');
  }

  if (text.includes('neural network')) {
    add('Neural Networks');
  }

  if (text.includes('data science')) {
    add('Data Science');
  }

  if (text.includes('power bi')) {
    add('Power BI');
  }

  if (text.includes('aws')) {
    add('AWS');
  }

  if (text.includes('cloud')) {
    add('Cloud Computing');
  }

  if (
    text.includes('cyber') ||
    text.includes('security')
  ) {
    add('Cybersecurity');
  }

  if (text.includes('algorithm')) {
    add('Algorithms');
  }

  if (text.includes('data structure')) {
    add('Data Structures');
  }

  if (!skills.length) {
    add(category);
  }

  return skills.slice(0, 8);
}

async function searchYouTube(query) {
  const url = new URL(
    'https://www.googleapis.com/youtube/v3/search'
  );

  url.searchParams.set(
    'part',
    'snippet'
  );

  url.searchParams.set(
    'q',
    query
  );

  url.searchParams.set(
    'type',
    'video'
  );

  url.searchParams.set(
    'maxResults',
    '10'
  );

  url.searchParams.set(
    'order',
    'relevance'
  );

  url.searchParams.set(
    'safeSearch',
    'strict'
  );

  url.searchParams.set(
    'key',
    YOUTUBE_API_KEY
  );

  const response =
    await fetch(url);

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `YouTube API ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

async function importCourses() {
  if (!YOUTUBE_API_KEY) {
    throw new Error(
      'YOUTUBE_API_KEY is missing from .env'
    );
  }

  await connectDB();

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const query of SEARCHES) {
    console.log(
      `\nSearching YouTube: ${query}`
    );

    let data;

    try {
      data =
        await searchYouTube(query);
    } catch (error) {
      console.error(
        `Search failed: ${error.message}`
      );
      continue;
    }

    let acceptedForSearch = 0;

    for (const item of data.items || []) {
      const videoId =
        item.id?.videoId;

      if (!videoId) {
        skipped++;
        continue;
      }

      const title =
        item.snippet?.title?.trim();

      if (!title) {
        skipped++;
        continue;
      }

      const description =
        item.snippet?.description?.trim() ||
        '';

      const channelTitle =
        item.snippet?.channelTitle ||
        'YouTube Creator';

      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      /*
       * Apply YouTube-specific quality filtering
       * before the common SkillHub domain filter.
       */
      if (
        !isQualityCourse(
          title,
          description
        )
      ) {
        skipped++;
        continue;
      }

      /*
       * Create a neutral candidate.
       *
       * The search query is NOT used as the category.
       * The common SkillHub domain filter decides the
       * correct category.
       */
      const candidate = {
        title,
        description:
          description.slice(0, 1000),
        platform: 'YouTube',
        instructor: channelTitle,
        skills: [],
        level: getLevel(title),
        durationHours:
          estimateDurationHours(title),
        url:
          `https://www.youtube.com/watch?v=${videoId}`,
        free: true,
        rating: 0,
        popularity: 0,
        thumbnail,
        status: 'active',
        lastChecked: new Date(),
        source: 'external_api'
      };

      const courseData =
        filterCourse(candidate);

      if (!courseData) {
        skipped++;
        continue;
      }

      courseData.skills =
        buildSkills(
          courseData.category,
          title
        );

      const existing =
        await Course.findOne({
          platform: 'YouTube',
          url: courseData.url
        });

      if (existing) {
        await Course.updateOne(
          { _id: existing._id },
          {
            $set: courseData
          }
        );

        updated++;
      } else {
        await Course.create(
          courseData
        );

        added++;
      }

      acceptedForSearch++;
    }

    console.log(
      `  Accepted for SkillHub: ${acceptedForSearch}`
    );
  }

  console.log(
    '\n======================================'
  );

  console.log(
    'SkillHub YouTube automatic import done'
  );

  console.log(
    '======================================'
  );

  console.log(
    `Searches used: ${SEARCHES.length}`
  );

  console.log(
    `New courses added: ${added}`
  );

  console.log(
    `Existing courses updated: ${updated}`
  );

  console.log(
    `Rejected/skipped results: ${skipped}`
  );

  console.log(
    '======================================'
  );

  await mongoose.connection.close();
}

importCourses().catch(
  async error => {
    console.error(
      '\nAutomatic YouTube import failed:'
    );

    console.error(
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
);
