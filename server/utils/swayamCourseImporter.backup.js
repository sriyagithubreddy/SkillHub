require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');

const BASE_URL = 'https://swayam.gov.in/search_courses';

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

const CATEGORY_RULES = [
  {
    category: 'Artificial Intelligence',
    words: [
      'artificial intelligence',
      'generative ai',
      'genai',
      'ai applications',
      'ai for',
      'intelligent systems'
    ]
  },
  {
    category: 'Machine Learning',
    words: [
      'machine learning',
      'deep learning',
      'reinforcement learning',
      'neural network',
      'neural networks',
      'computer vision'
    ]
  },
  {
    category: 'Data Science',
    words: [
      'data science',
      'data analytics',
      'data analysis',
      'data mining',
      'big data',
      'data visualization',
      'statistics',
      'analytics'
    ]
  },
  {
    category: 'Cyber Security',
    words: [
      'cyber security',
      'cybersecurity',
      'ethical hacking',
      'information security',
      'network security',
      'cryptography',
      'digital forensics'
    ]
  },
  {
    category: 'Cloud Computing',
    words: [
      'cloud computing',
      'cloud technology',
      'cloud architecture',
      'cloud'
    ]
  },
  {
    category: 'Web Development',
    words: [
      'web development',
      'web application',
      'web programming',
      'frontend',
      'backend',
      'html',
      'css',
      'javascript'
    ]
  },
  {
    category: 'Database',
    words: [
      'database',
      'sql',
      'nosql',
      'dbms',
      'data management'
    ]
  },
  {
    category: 'Programming',
    words: [
      'programming',
      'python',
      'java',
      'c programming',
      'c++',
      'computer programming',
      'software programming',
      'algorithms',
      'data structures'
    ]
  },
  {
    category: 'UI/UX',
    words: [
      'ui/ux',
      'user interface',
      'user experience',
      'interaction design',
      'ux design',
      'ui design'
    ]
  },
  {
    category: 'Business',
    words: [
      'business',
      'management',
      'marketing',
      'finance',
      'accounting',
      'entrepreneurship',
      'leadership',
      'commerce'
    ]
  },
  {
    category: 'Communication',
    words: [
      'communication',
      'english',
      'writing',
      'presentation skills',
      'soft skills',
      'professional communication'
    ]
  }
];

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

  const match = html.match(regex);

  return match ? decodeHtml(match[1]) : '';
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
  const match = card.match(
    /(\d+(?:\.\d+)?)\s*Weeks?/i
  );

  if (!match) {
    return 8;
  }

  return Math.max(
    1,
    Math.round(Number(match[1]) * 3)
  );
}

function extractThumbnail(card) {
  const match = card.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  return match
    ? decodeHtml(match[1])
    : 'https://storage.googleapis.com/swayam2_central/assets/img/swayam_images/ico/180x180.png';
}

function extractCourseUrl(card) {
  const match = card.match(
    /<a[^>]+href=["'](https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"']+)["']/i
  );

  return match
    ? decodeHtml(match[1])
    : '';
}

function determineCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (
      rule.words.some(word =>
        text.includes(word.toLowerCase())
      )
    ) {
      return rule.category;
    }
  }

  return 'Communication';
}

function determineLevel(title, description) {
  const text = `${title} ${description}`.toLowerCase();

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

function extractCourseCards(html) {
  const cards = [];
  const regex =
    /<div[^>]+class=["'][^"']*es-course-card[^"']*["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    cards.push(match[0]);
  }

  return cards;
}

function extractCardsByAnchor(html) {
  const cards = [];
  const regex =
    /<a[^>]+href=["']https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"']+["'][\s\S]*?<\/a>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const start = Math.max(0, match.index - 300);
    const end = Math.min(
      html.length,
      match.index + match[0].length + 7000
    );

    cards.push(html.slice(start, end));
  }

  return cards;
}

function parseCourses(html) {
  const results = [];

  const urlRegex =
    /href=["'](https:\/\/onlinecourses\.swayam2\.ac\.in\/[^"']+)["']/gi;

  const matches = [...html.matchAll(urlRegex)];

  for (let i = 0; i < matches.length; i++) {
    const url = matches[i][1];

    const start =
      Math.max(0, matches[i].index - 100);

    const end =
      i + 1 < matches.length
        ? matches[i + 1].index
        : Math.min(
            html.length,
            matches[i].index + 10000
          );

    const card =
      html.substring(start, end);

    const title = extractTitle(card);

    if (!title) continue;

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

    const category =
      determineCategory(
        title,
        description
      );

    const level =
      determineLevel(
        title,
        description
      );

    const skills = [
      category,
      ...title
        .split(/[,/:()\-]/)
        .map(x => x.trim())
        .filter(x => x.length >= 3)
        .slice(0, 4)
    ];

    results.push({
      title,
      description,
      platform: 'SWAYAM',
      instructor,
      category,
      skills: [...new Set(skills)],
      level,
      durationHours,
      url,
      thumbnail: extractThumbnail(card),
      free: true,
      rating: 0,
      popularity: 0,
      status: 'active',
      lastChecked: new Date(),
      source: 'external_api'
    });
  }

  return results;
}
async function fetchSearchResults(term) {
  const url =
    `${BASE_URL}?searchText=${encodeURIComponent(term)}`;

  console.log(`Searching SWAYAM: ${term}`);

  const response = await fetch(url);

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

    const courseMap = new Map();

    for (const term of SEARCH_TERMS) {
      try {
        const html =
          await fetchSearchResults(term);

        const courses =
          parseCourses(html);

        for (const course of courses) {
          /*
           * SWAYAM's central catalog also contains NPTEL
           * courses. NPTEL was intentionally removed from
           * SkillHub, so those courses must not enter the
           * SWAYAM collection.
           */
          const combinedText =
            `${course.title} ${course.description} ${course.instructor}`
              .toLowerCase();

          if (
            combinedText.includes('nptel') ||
            course.url.includes('nptel')
          ) {
            continue;
          }

          courseMap.set(course.url, course);
        }

        console.log(
          `  Found ${courses.length} cards, kept ${courseMap.size} unique courses so far.`
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
        'No SWAYAM courses were discovered. Existing database records were NOT changed.'
      );
    }

    console.log(
      `\nDiscovered ${courses.length} unique SWAYAM courses.`
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
              updatedAt: new Date()
            }
          }
        );

        updated++;
      } else {
        await Course.create(course);
        added++;
      }
    }

    const validUrls =
      courses.map(course => course.url);

    const staleResult =
      await Course.updateMany(
        {
          platform: 'SWAYAM',
          source: 'external_api',
          url: { $nin: validUrls }
        },
        {
          $set: {
            status: 'unavailable',
            lastChecked: new Date()
          }
        }
      );

    console.log('\n======================================');
    console.log('SkillHub SWAYAM automatic import done');
    console.log('======================================');
    console.log(`Search terms used: ${SEARCH_TERMS.length}`);
    console.log(`Unique courses discovered: ${courses.length}`);
    console.log(`New courses added: ${added}`);
    console.log(`Existing courses updated: ${updated}`);
    console.log(
      `Stale courses marked unavailable: ${staleResult.modifiedCount}`
    );
    console.log('======================================');

    await mongoose.connection.close();
  } catch (error) {
    console.error('\nSWAYAM import failed:');
    console.error(error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

importSWAYAMCourses();

