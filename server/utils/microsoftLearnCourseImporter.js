require('dotenv').config();

const connectDB = require('../config/db');
const Course = require('../models/Course');

const CATALOG_URL =
  'https://learn.microsoft.com/api/catalog/?locale=en-us';

const ALLOWED_CATEGORIES = [
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'App Development',
  'Cyber Security',
  'Cloud Computing',
  'Programming',
  'Database',
  'UI/UX',
  'Business',
  'Communication'
];

function mapCategory(item) {
  const text = [
    item.title,
    item.summary,
    ...(item.subjects || []),
    ...(item.products || []),
    ...(item.roles || [])
  ]
    .join(' ')
    .toLowerCase();

  if (
    text.includes('machine learning') ||
    text.includes('mlops') ||
    text.includes('scikit')
  ) {
    return 'Machine Learning';
  }

  if (
    text.includes('artificial intelligence') ||
    text.includes('generative ai') ||
    text.includes('azure openai') ||
    text.includes('copilot')
  ) {
    return 'Artificial Intelligence';
  }

  if (
    text.includes('data science') ||
    text.includes('data scientist') ||
    text.includes('data analysis') ||
    text.includes('analytics')
  ) {
    return 'Data Science';
  }

  if (
    text.includes('cyber') ||
    text.includes('security') ||
    text.includes('defender')
  ) {
    return 'Cyber Security';
  }

  if (
    text.includes('database') ||
    text.includes('sql') ||
    text.includes('cosmos db')
  ) {
    return 'Database';
  }

  if (
    text.includes('web development') ||
    text.includes('javascript') ||
    text.includes('html') ||
    text.includes('css') ||
    text.includes('react')
  ) {
    return 'Web Development';
  }

  if (
    text.includes('power platform') ||
    text.includes('power apps')
  ) {
    return 'Programming';
  }

  if (
    text.includes('azure') ||
    text.includes('cloud') ||
    text.includes('aws')
  ) {
    return 'Cloud Computing';
  }

  if (
    text.includes('python') ||
    text.includes('programming') ||
    text.includes('c#') ||
    text.includes('c++') ||
    text.includes('.net')
  ) {
    return 'Programming';
  }

  return 'Programming';
}

function mapLevel(item) {
  const levels = (item.levels || []).map(level =>
    String(level).toLowerCase()
  );

  if (levels.includes('advanced')) {
    return 'Advanced';
  }

  if (levels.includes('intermediate')) {
    return 'Intermediate';
  }

  return 'Beginner';
}

function estimateDuration(item) {
  const minutes =
    Number(item.duration_in_minutes) ||
    Number(item.durationInMinutes) ||
    Number(item.duration) ||
    30;

  return Math.max(
    0.5,
    Math.round((minutes / 60) * 10) / 10
  );
}

function getUrl(item) {
  if (item.url) return item.url;

  if (item.type === 'module' && item.uid) {
    return `https://learn.microsoft.com/training/modules/${item.uid}/`;
  }

  if (item.type === 'learningPath' && item.uid) {
    return `https://learn.microsoft.com/training/paths/${item.uid}/`;
  }

  return null;
}

function normalizeItem(item) {
  const url = getUrl(item);

  if (!item.title || !url) {
    return null;
  }

  const category = mapCategory(item);

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return null;
  }

  const typeLabel =
    item.type === 'learningPath'
      ? 'Learning Path'
      : 'Module';

  return {
    title: item.title.trim(),

    description:
      item.summary ||
      `Microsoft Learn ${typeLabel.toLowerCase()} for students and learners.`,

    platform: 'Microsoft Learn',

    instructor: 'Microsoft Learn',

    category,

    skills: [
      ...(item.subjects || []),
      ...(item.products || []),
      ...(item.roles || [])
    ]
      .filter(Boolean)
      .slice(0, 10),

    level: mapLevel(item),

    durationHours: estimateDuration(item),

    url,

    thumbnail:
      'https://learn.microsoft.com/favicon.ico',

    free: true,

    rating: 4.8,

    popularity: 85,

    status: 'active',

    lastChecked: new Date(),

    source: 'external_api'
  };
}

async function importMicrosoftLearn() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Downloading Microsoft Learn catalog...');

    const response = await fetch(CATALOG_URL);

    if (!response.ok) {
      throw new Error(
        `Microsoft Learn catalog returned HTTP ${response.status}`
      );
    }

    const catalog = await response.json();

    const items = [
      ...(catalog.modules || []),
      ...(catalog.learningPaths || [])
    ];

    console.log(
      `Microsoft Learn catalog items found: ${items.length}`
    );

    const normalized = items
      .map(normalizeItem)
      .filter(Boolean);

    const unique = new Map();

    for (const course of normalized) {
      unique.set(course.url, course);
    }

    const courses = [...unique.values()];

    console.log(
      `Microsoft Learn courses after filtering: ${courses.length}`
    );

    let added = 0;
    let updated = 0;

    for (const course of courses) {
      const existing = await Course.findOne({
        platform: 'Microsoft Learn',
        url: course.url
      });

      if (existing) {
        await Course.updateOne(
          { _id: existing._id },
          { $set: course }
        );

        updated++;
      } else {
        await Course.create(course);
        added++;
      }
    }

    console.log(
      `Microsoft Learn import complete. Added: ${added}, Updated: ${updated}`
    );

    await Course.updateMany(
      {
        platform: 'Microsoft Learn',
        source: 'external_api',
        url: {
          $nin: courses.map(course => course.url)
        }
      },
      {
        $set: {
          status: 'unavailable',
          lastChecked: new Date()
        }
      }
    );

    console.log('Microsoft Learn stale courses checked.');

    process.exit(0);
  } catch (error) {
    console.error(
      'Microsoft Learn importer failed:',
      error.message
    );

    process.exit(1);
  }
}

importMicrosoftLearn();
