require('dotenv').config();

const axios = require('axios');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');

const CURRICULUM_URL =
  'https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/structure/curriculum.json';

const PLATFORM = 'freeCodeCamp';

function titleFromSlug(slug) {
  return slug
    .replace(/-v\d+$/i, '')
    .replace(/^\d+\//, '')
    .split('-')
    .map(word => {
      const lower = word.toLowerCase();

      if (lower === 'api') return 'API';
      if (lower === 'apis') return 'APIs';
      if (lower === 'sql') return 'SQL';
      if (lower === 'css') return 'CSS';
      if (lower === 'html') return 'HTML';
      if (lower === 'javascript') return 'JavaScript';
      if (lower === 'python') return 'Python';
      if (lower === 'github') return 'GitHub';
      if (lower === 'git') return 'Git';
      if (lower === 'mcp') return 'MCP';
      if (lower === 'rag') return 'RAG';

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function getCategory(slug) {
  const text = slug.toLowerCase();

  if (
    text.includes('machine-learning') ||
    text.includes('data-analysis') ||
    text.includes('data-visualization') ||
    text.includes('data-science')
  ) {
    return text.includes('machine-learning')
      ? 'Machine Learning'
      : 'Data Science';
  }

  if (
    text.includes('security') ||
    text.includes('information-security')
  ) {
    return 'Cyber Security';
  }

  if (
    text.includes('database') ||
    text.includes('sql') ||
    text.includes('postgres')
  ) {
    return 'Database';
  }

  if (
    text.includes('cloud') ||
    text.includes('aws') ||
    text.includes('azure')
  ) {
    return 'Cloud Computing';
  }

  if (
    text.includes('react') ||
    text.includes('front-end') ||
    text.includes('frontend') ||
    text.includes('back-end') ||
    text.includes('backend') ||
    text.includes('web') ||
    text.includes('html') ||
    text.includes('css')
  ) {
    return 'Web Development';
  }

  if (
    text.includes('python') ||
    text.includes('javascript') ||
    text.includes('algorithm') ||
    text.includes('programming') ||
    text.includes('coding') ||
    text.includes('bash') ||
    text.includes('git') ||
    text.includes('c-sharp')
  ) {
    return 'Programming';
  }

  return 'Programming';
}

function getLevel(slug) {
  const text = slug.toLowerCase();

  if (
    text.includes('machine-learning') ||
    text.includes('information-security') ||
    text.includes('algorithm') ||
    text.includes('advanced')
  ) {
    return 'Advanced';
  }

  if (
    text.includes('database') ||
    text.includes('data-analysis') ||
    text.includes('data-visualization') ||
    text.includes('back-end') ||
    text.includes('front-end')
  ) {
    return 'Intermediate';
  }

  return 'Beginner';
}

function getDuration(slug) {
  const text = slug.toLowerCase();

  if (
    text.includes('certification') ||
    text.includes('full-stack') ||
    text.includes('responsive-web-design') ||
    text.includes('javascript-algorithms')
  ) {
    return 40;
  }

  if (
    text.includes('introduction') ||
    text.includes('basic') ||
    text.includes('fundamentals')
  ) {
    return 8;
  }

  if (
    text.includes('learn-') ||
    text.includes('css-') ||
    text.includes('html-')
  ) {
    return 6;
  }

  return 10;
}

function buildSkills(slug) {
  const text = slug.toLowerCase();
  const skills = [];

  const add = skill => {
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  };

  if (text.includes('python')) add('Python');
  if (text.includes('javascript')) add('JavaScript');
  if (text.includes('typescript')) add('TypeScript');
  if (text.includes('html')) add('HTML');
  if (text.includes('css')) add('CSS');
  if (text.includes('react')) add('React');
  if (text.includes('node')) add('Node.js');
  if (text.includes('api')) add('APIs');
  if (text.includes('sql')) add('SQL');
  if (text.includes('postgres')) add('PostgreSQL');
  if (text.includes('database')) add('Database');
  if (text.includes('machine-learning')) add('Machine Learning');
  if (text.includes('data-analysis')) add('Data Analysis');
  if (text.includes('data-visualization')) add('Data Visualization');
  if (text.includes('security')) add('Cybersecurity');
  if (text.includes('algorithm')) add('Algorithms');
  if (text.includes('data-structure')) add('Data Structures');
  if (text.includes('git')) add('Git');
  if (text.includes('github')) add('GitHub');
  if (text.includes('bash')) add('Bash');
  if (text.includes('rag')) add('RAG');
  if (text.includes('mcp')) add('MCP');

  if (!skills.length) {
    add('Programming');
  }

  return skills.slice(0, 8);
}

async function downloadCurriculum() {
  console.log(
    '\nDownloading official freeCodeCamp curriculum...'
  );

  const response = await axios.get(
    CURRICULUM_URL,
    {
      timeout: 30000,
      headers: {
        'User-Agent': 'SkillHub Course Importer'
      }
    }
  );

  if (!response.data) {
    throw new Error(
      'Official curriculum returned empty data.'
    );
  }

  return response.data;
}

async function importFreeCodeCampCourses() {
  try {
    await connectDB();

    console.log('\n======================================');
    console.log('SKILLHUB FREECODECAMP AUTO IMPORT');
    console.log('======================================');

    const curriculum =
      await downloadCurriculum();

    const superblocks =
      Array.isArray(curriculum.superblocks)
        ? curriculum.superblocks
        : [];

    const certifications =
      Array.isArray(curriculum.certifications)
        ? curriculum.certifications
        : [];

    /*
     * Combine both official lists.
     *
     * Set removes duplicates automatically.
     */
    const discoveredSlugs = [
      ...new Set([
        ...superblocks,
        ...certifications
      ])
    ];

    console.log(
      `Superblocks discovered: ${superblocks.length}`
    );

    console.log(
      `Certifications discovered: ${certifications.length}`
    );

    console.log(
      `Unique learning paths discovered: ${discoveredSlugs.length}`
    );

    let added = 0;
    let updated = 0;

    const importedUrls = new Set();

    for (const slug of discoveredSlugs) {
      if (!slug || typeof slug !== 'string') {
        continue;
      }

      const cleanSlug = slug.trim();

      if (!cleanSlug) {
        continue;
      }

      const title =
        titleFromSlug(cleanSlug);

      const url =
        `https://www.freecodecamp.org/learn/${cleanSlug}/`;

      const courseData = {
        title: `freeCodeCamp: ${title}`,

        description:
          `${title} — official freeCodeCamp curriculum. ` +
          `Free and self-paced learning.`,

        platform: PLATFORM,

        instructor: 'freeCodeCamp',

        category:
          getCategory(cleanSlug),

        skills:
          buildSkills(cleanSlug),

        level:
          getLevel(cleanSlug),

        durationHours:
          getDuration(cleanSlug),

        url,

        free: true,

        rating: 0,

        popularity: 0,

        thumbnail:
          'https://design-style-guide.freecodecamp.org/downloads/fcc_secondary_small.svg',

        status: 'active',

        lastChecked: new Date(),

        source: 'external_api'
      };

      importedUrls.add(url);

      const existing =
        await Course.findOne({
          platform: PLATFORM,
          url
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

    /*
     * Remove old automatic freeCodeCamp records
     * that are no longer present in the official
     * curriculum.
     *
     * Admin-created courses are NOT touched.
     */
    const existingImported =
      await Course.find({
        platform: PLATFORM,
        source: 'external_api'
      }).select('_id url');

    let removed = 0;

    for (const course of existingImported) {
      if (!importedUrls.has(course.url)) {
        await Course.deleteOne({
          _id: course._id
        });

        removed++;
      }
    }

    console.log('\n======================================');
    console.log('FREECODECAMP AUTO IMPORT COMPLETED');
    console.log('======================================');
    console.log(
      `Official superblocks: ${superblocks.length}`
    );
    console.log(
      `Official certifications: ${certifications.length}`
    );
    console.log(
      `Unique paths imported: ${discoveredSlugs.length}`
    );
    console.log(`Added: ${added}`);
    console.log(`Updated: ${updated}`);
    console.log(`Removed stale: ${removed}`);
    console.log('======================================');

    await mongoose.connection.close();
  } catch (error) {
    console.error('\n======================================');
    console.error('FREECODECAMP IMPORT FAILED');
    console.error('======================================');
    console.error(error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

importFreeCodeCampCourses();