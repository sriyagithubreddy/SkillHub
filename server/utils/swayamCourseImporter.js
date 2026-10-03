require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');

const {
  filterCourse
} = require('./courseDomainFilter');

const BASE_URL =
  'https://swayam.gov.in/search_courses';

const SEARCH_TERMS = [
  'programming',
  'python',
  'java',
  'data science',
  'data analytics',
  'machine learning',
  'artificial intelligence',
  'deep learning',
  'computer science',
  'web development',
  'database',
  'cloud computing',
  'cyber security',
  'software engineering',
  'statistics',
  'mathematics',
  'business',
  'management',
  'digital marketing',
  'communication',
  'english',
  'ui ux',
  'design',
  'entrepreneurship'
];

const FALLBACK_THUMBNAIL =
  'https://storage.googleapis.com/swayam2_central/assets/img/swayam_images/ico/180x180.png';

function cleanText(value = '') {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value = '') {
  return cleanText(value);
}

function extractAttribute(html, attribute) {
  const regex = new RegExp(
    `${attribute}=["']([^"']*)["']`,
    'i'
  );

  const match =
    html.match(regex);

  return match
    ? decodeHtml(match[1])
    : '';
}

function extractTitle(card) {
  const match = card.match(
    /class=["'][^"']*courseTitle[^"']*["'][\s\S]*?title=["']([^"']+)["']/i
  );

  if (match) {
    return decodeHtml(match[1]);
  }

  const fallback = card.match(
    /class=["'][^"']*courseTitle[^"']*["'][\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i
  );

  return fallback
    ? decodeHtml(fallback[1])
    : '';
}

function extractInstructor(card) {
  const match = card.match(
    /class=["'][^"']*courseInstructor[^"']*["'][\s\S]*?title=["']([^"']+)["']/i
  );

  if (match) {
    return decodeHtml(match[1]);
  }

  const fallback = card.match(
    /class=["'][^"']*courseInstructor[^"']*["'][\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i
  );

  return fallback
    ? decodeHtml(fallback[1])
    : '';
}

function extractInstitute(card) {
  const match = card.match(
    /class=["'][^"']*courseInstitute[^"']*["'][\s\S]*?title=["']([^"']+)["']/i
  );

  if (match) {
    return decodeHtml(match[1]);
  }

  const fallback = card.match(
    /class=["'][^"']*courseInstitute[^"']*["'][\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i
  );

  return fallback
    ? decodeHtml(fallback[1])
    : '';
}

function extractDuration(card) {
  const match =
    card.match(
      /(\d+(?:\.\d+)?)\s*Weeks?/i
    );

  if (!match) {
    return 8;
  }

  return Math.max(
    1,
    Math.round(
      Number(match[1]) * 3
    )
  );
}

function isUsableThumbnail(url) {
  if (!url) return false;

  const lower =
    url.toLowerCase();

  if (
    lower.includes('data:image') ||
    lower.includes('javascript:')
  ) {
    return false;
  }

  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://')
  );
}

function extractThumbnail(card) {
  const images = [
    ...card.matchAll(
      /<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi
    )
  ];

  for (const match of images) {
    const url =
      decodeHtml(match[1]);

    if (isUsableThumbnail(url)) {
      return url;
    }
  }

  return FALLBACK_THUMBNAIL;
}

function extractCourseUrl(card) {
  const match = card.match(
    /<a[^>]+href=["'](https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"']+)["']/i
  );

  return match
    ? decodeHtml(match[1])
    : '';
}

function determineLevel(title) {
  const text =
    title.toLowerCase();

  if (
    text.includes('advanced') ||
    text.includes('expert') ||
    text.includes('specialization')
  ) {
    return 'Advanced';
  }

  if (
    text.includes('intermediate') ||
    text.includes('advanced level')
  ) {
    return 'Intermediate';
  }

  return 'Beginner';
}

function buildSkills(category, title) {
  const text =
    title.toLowerCase();

  const skills = [];

  const add = skill => {
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  };

  if (text.includes('python')) add('Python');
  if (text.includes('java')) add('Java');
  if (text.includes('javascript')) {
    add('JavaScript');
  }
  if (text.includes('sql')) add('SQL');
  if (text.includes('data science')) {
    add('Data Science');
  }
  if (text.includes('data analytics')) {
    add('Data Analytics');
  }
  if (text.includes('machine learning')) {
    add('Machine Learning');
  }
  if (text.includes('deep learning')) {
    add('Deep Learning');
  }
  if (text.includes('artificial intelligence')) {
    add('Artificial Intelligence');
  }
  if (text.includes('neural network')) {
    add('Neural Networks');
  }
  if (text.includes('computer vision')) {
    add('Computer Vision');
  }
  if (text.includes('cyber security')) {
    add('Cybersecurity');
  }
  if (text.includes('cloud')) {
    add('Cloud Computing');
  }
  if (text.includes('database')) {
    add('Database');
  }
  if (text.includes('sql')) {
    add('SQL');
  }
  if (text.includes('web')) {
    add('Web Development');
  }
  if (text.includes('programming')) {
    add('Programming');
  }
  if (text.includes('algorithm')) {
    add('Algorithms');
  }

  if (!skills.length) {
    add(category);
  }

  return skills.slice(0, 8);
}

function parseCourses(html) {
  const results = [];

  const urlRegex =
    /href=["'](https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"']+)["']/gi;

  const matches =
    [...html.matchAll(urlRegex)];

  for (
    let i = 0;
    i < matches.length;
    i++
  ) {
    const url =
      matches[i][1];

    const start =
      Math.max(
        0,
        matches[i].index - 100
      );

    const end =
      i + 1 < matches.length
        ? matches[i + 1].index
        : Math.min(
            html.length,
            matches[i].index + 10000
          );

    const card =
      html.substring(
        start,
        end
      );

    const title =
      extractTitle(card);

    if (!title) {
      continue;
    }

    const instructor =
      extractInstructor(card) ||
      'SWAYAM Faculty';

    const institute =
      extractInstitute(card);

    const durationHours =
      extractDuration(card);

    const description = [
      'Free course available through SWAYAM.',
      institute
        ? `Institution: ${institute}.`
        : '',
      instructor
        ? `Instructor: ${instructor}.`
        : ''
    ]
      .filter(Boolean)
      .join(' ');

    const candidate = {
      title,
      description,
      platform: 'SWAYAM',
      instructor,
      skills: [],
      level:
        determineLevel(title),
      durationHours,
      url,
      thumbnail:
        extractThumbnail(card),
      free: true,
      rating: 0,
      popularity: 0,
      status: 'active',
      lastChecked:
        new Date(),
      source: 'external_api'
    };

    const filtered =
      filterCourse(candidate);

    if (!filtered) {
      continue;
    }

    filtered.skills =
      buildSkills(
        filtered.category,
        title
      );

    results.push(filtered);
  }

  return results;
}

async function fetchSearchResults(term) {
  const url =
    `${BASE_URL}?searchText=${encodeURIComponent(term)}`;

  console.log(
    `Searching SWAYAM: ${term}`
  );

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `SWAYAM returned HTTP ${response.status} for "${term}"`
    );
  }

  return response.text();
}

async function importSWAYAMCourses() {
  try {
    await connectDB();

    const courseMap =
      new Map();

    let rejected =
      0;

    for (const term of SEARCH_TERMS) {
      try {
        const html =
          await fetchSearchResults(term);

        const courses =
          parseCourses(html);

        for (const course of courses) {
          const combinedText =
            `${course.title} ${course.description} ${course.instructor}`
              .toLowerCase();

          /*
           * SWAYAM's central catalog can contain
           * NPTEL courses. Keep them out of the
           * SWAYAM collection.
           */
          if (
            combinedText.includes('nptel') ||
            course.url
              .toLowerCase()
              .includes('nptel')
          ) {
            rejected++;
            continue;
          }

          courseMap.set(
            course.url,
            course
          );
        }

        console.log(
          `  Found ${courses.length} supported courses, kept ${courseMap.size} unique courses so far.`
        );
      } catch (error) {
        console.error(
          `  Search failed for "${term}": ${error.message}`
        );
      }
    }

    const courses =
      [...courseMap.values()];

    if (!courses.length) {
      throw new Error(
        'No supported SWAYAM courses were discovered. Existing database records were NOT changed.'
      );
    }

    console.log(
      `\nDiscovered ${courses.length} unique supported SWAYAM courses.`
    );

    let added = 0;
    let updated = 0;

    for (const course of courses) {
      const existing =
        await Course.findOne({
          platform: 'SWAYAM',
          url: course.url
        });

      if (existing) {
        await Course.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...course,
              updatedAt:
                new Date()
            }
          }
        );

        updated++;
      } else {
        await Course.create(
          course
        );

        added++;
      }
    }

    const validUrls =
      courses.map(
        course => course.url
      );

    /*
     * Only automatic SWAYAM records are
     * marked unavailable. Admin-created
     * courses are untouched.
     */
    const staleResult =
      await Course.updateMany(
        {
          platform: 'SWAYAM',
          source: 'external_api',
          url: {
            $nin: validUrls
          }
        },
        {
          $set: {
            status: 'unavailable',
            lastChecked:
              new Date()
          }
        }
      );

    console.log(
      '\n======================================'
    );
    console.log(
      'SkillHub SWAYAM automatic import done'
    );
    console.log(
      '======================================'
    );
    console.log(
      `Search terms used: ${SEARCH_TERMS.length}`
    );
    console.log(
      `Unique supported courses: ${courses.length}`
    );
    console.log(
      `New courses added: ${added}`
    );
    console.log(
      `Existing courses updated: ${updated}`
    );
    console.log(
      `Rejected/skipped: ${rejected}`
    );
    console.log(
      `Stale courses marked unavailable: ${staleResult.modifiedCount}`
    );
    console.log(
      '======================================'
    );

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      '\nSWAYAM import failed:'
    );

    console.error(
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

importSWAYAMCourses();
