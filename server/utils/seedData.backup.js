// Populates SkillHub with verified course/resource listings.
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const User = require('../models/User');

const courses = [
  // ============================================================
  // PROGRAMMING
  // ============================================================

  {
    title: 'Programming for Everybody (Getting Started with Python)',
    platform: 'Coursera',
    instructor: 'Charles Russell Severance',
    category: 'Programming',
    skills: ['Python', 'Programming Fundamentals', 'Debugging'],
    level: 'Beginner',
    durationHours: 20,
    url: 'https://www.coursera.org/learn/python',
    free: false,
    rating: 4.8,
    popularity: 98,
    thumbnail: 'https://placehold.co/400x225?text=Python',
    description: 'Beginner Python course covering installation, variables, functions, loops and core programming concepts.'
  },

  {
    title: 'Python for Data Science, AI & Development',
    platform: 'Coursera',
    instructor: 'Joseph Santarcangelo (IBM)',
    category: 'Programming',
    skills: ['Python', 'NumPy', 'Data Science', 'AI'],
    level: 'Beginner',
    durationHours: 20,
    url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai',
    free: false,
    rating: 4.6,
    popularity: 95,
    thumbnail: 'https://placehold.co/400x225?text=Python+AI',
    description: 'Introduction to Python programming with applications in data science and artificial intelligence.'
  },

  {
    title: 'CS50: Introduction to Computer Science',
    platform: 'edX',
    instructor: 'David J. Malan (Harvard University)',
    category: 'Programming',
    skills: ['C', 'Python', 'SQL', 'JavaScript', 'Algorithms', 'Data Structures'],
    level: 'Beginner',
    durationHours: 72,
    url: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
    free: true,
    rating: 4.9,
    popularity: 100,
    thumbnail: 'https://placehold.co/400x225?text=CS50',
    description: 'Harvard introductory computer science course covering algorithms, programming, data structures, security and web development.'
  },

  {
    title: 'Learn Python - Full Course for Beginners',
    platform: 'YouTube',
    instructor: 'freeCodeCamp.org',
    category: 'Programming',
    skills: ['Python', 'Programming Fundamentals', 'OOP'],
    level: 'Beginner',
    durationHours: 4.5,
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    free: true,
    rating: 4.9,
    popularity: 99,
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    description: 'Full beginner Python course covering variables, strings, lists, functions, loops, files, classes and more.'
  },

  {
    title: 'C Programming and Assembly Language',
    platform: 'NPTEL',
    instructor: 'Prof. Janakiraman Viraraghavan (IIT Madras)',
    category: 'Programming',
    skills: ['C', 'Assembly Language', 'Microprocessors'],
    level: 'Intermediate',
    durationHours: 30,
    url: 'https://www.nptel.ac.in/courses/106106210',
    free: true,
    rating: 4.5,
    popularity: 75,
    thumbnail: 'https://placehold.co/400x225?text=C+Programming',
    description: 'NPTEL course connecting C programming with assembly language and microprocessor execution.'
  },

  {
    title: 'Getting Started With Competitive Programming',
    platform: 'NPTEL',
    instructor: 'Prof. Neeldhara Misra (IIT Gandhinagar)',
    category: 'Programming',
    skills: ['Algorithms', 'Competitive Programming', 'C++', 'Python', 'Dynamic Programming'],
    level: 'Advanced',
    durationHours: 30,
    url: 'https://www.nptel.ac.in/courses/106106231',
    free: true,
    rating: 4.6,
    popularity: 85,
    thumbnail: 'https://placehold.co/400x225?text=Competitive+Programming',
    description: 'Algorithm-focused course covering sorting, greedy algorithms, graph algorithms, shortest paths and dynamic programming.'
  },

  // ============================================================
  // DATA SCIENCE
  // ============================================================

  {
    title: 'What is Data Science?',
    platform: 'Coursera',
    instructor: 'Rav Ahuja and Alex Aklson (IBM)',
    category: 'Data Science',
    skills: ['Data Science', 'Data Analysis', 'Machine Learning', 'Big Data'],
    level: 'Beginner',
    durationHours: 10,
    url: 'https://www.coursera.org/learn/what-is-datascience',
    free: false,
    rating: 4.7,
    popularity: 97,
    thumbnail: 'https://placehold.co/400x225?text=Data+Science',
    description: 'IBM introductory course explaining data science, data analysis, machine learning, big data and career paths.'
  },

  {
    title: 'A Crash Course in Data Science',
    platform: 'Coursera',
    instructor: 'Jeff Leek (Johns Hopkins University)',
    category: 'Data Science',
    skills: ['Data Science', 'Statistics', 'Machine Learning', 'Data Analysis'],
    level: 'Beginner',
    durationHours: 8,
    url: 'https://www.coursera.org/learn/data-science-course',
    free: false,
    rating: 4.5,
    popularity: 82,
    thumbnail: 'https://placehold.co/400x225?text=Data+Science+Crash+Course',
    description: 'Introduction to data science terminology, statistics, machine learning and the structure of data science projects.'
  },

  {
    title: 'Data Science: Statistics and Machine Learning',
    platform: 'Coursera',
    instructor: 'Roger D. Peng, Brian Caffo and Jeff Leek',
    category: 'Data Science',
    skills: ['Statistics', 'Machine Learning', 'R', 'Data Visualization'],
    level: 'Intermediate',
    durationHours: 120,
    url: 'https://www.coursera.org/specializations/data-science-statistics-machine-learning',
    free: false,
    rating: 4.4,
    popularity: 90,
    thumbnail: 'https://placehold.co/400x225?text=Statistics+ML',
    description: 'Intermediate specialization covering statistical inference, regression, machine learning and data visualization.'
  },

  {
    title: 'Python for Data Science',
    platform: 'NPTEL',
    instructor: 'Prof. Ragunathan Rengasamy (IIT Madras)',
    category: 'Data Science',
    skills: ['Python', 'Data Science', 'Pandas', 'Data Analysis'],
    level: 'Beginner',
    durationHours: 30,
    url: 'https://www.nptel.ac.in/courses',
    free: true,
    rating: 4.5,
    popularity: 88,
    thumbnail: 'https://placehold.co/400x225?text=NPTEL+Python+DS',
    description: 'NPTEL data science learning resource covering Python-based data science concepts.'
  },

  {
    title: 'Statistical and Machine Learning Approaches for Data Science',
    platform: 'NPTEL',
    instructor: 'NPTEL / IIT faculty',
    category: 'Data Science',
    skills: ['Statistics', 'Probability', 'Machine Learning', 'Data Visualization'],
    level: 'Intermediate',
    durationHours: 30,
    url: 'https://nptel.ac.in/courses/105105001',
    free: true,
    rating: 4.5,
    popularity: 78,
    thumbnail: 'https://placehold.co/400x225?text=Statistics+ML',
    description: 'Course material covering statistical foundations, probability, data visualization and machine learning concepts.'
  },

  // ============================================================
  // MACHINE LEARNING
  // ============================================================

  {
    title: 'Supervised Machine Learning: Regression and Classification',
    platform: 'Coursera',
    instructor: 'Andrew Ng and Stanford Online / DeepLearning.AI',
    category: 'Machine Learning',
    skills: ['Machine Learning', 'Python', 'Regression', 'Classification', 'Scikit-Learn'],
    level: 'Beginner',
    durationHours: 30,
    url: 'https://www.coursera.org/learn/machine-learning',
    free: false,
    rating: 4.9,
    popularity: 99,
    thumbnail: 'https://placehold.co/400x225?text=Machine+Learning',
    description: 'Machine learning course covering supervised learning, regression, classification, model training and evaluation.'
  },

  {
    title: 'Machine Learning',
    platform: 'NPTEL',
    instructor: 'NPTEL / IIT faculty',
    category: 'Machine Learning',
    skills: ['Machine Learning', 'Regression', 'Classification', 'Neural Networks'],
    level: 'Intermediate',
    durationHours: 40,
    url: 'https://www.nptel.ac.in/courses/106106198',
    free: true,
    rating: 4.6,
    popularity: 90,
    thumbnail: 'https://placehold.co/400x225?text=NPTEL+Machine+Learning',
    description: 'NPTEL machine learning course covering core ML algorithms and practical application of machine learning techniques.'
  },

  {
    title: 'Machine Learning with Python and Scikit-Learn',
    platform: 'YouTube',
    instructor: 'freeCodeCamp.org',
    category: 'Machine Learning',
    skills: ['Python', 'Scikit-Learn', 'Regression', 'Classification', 'XGBoost'],
    level: 'Intermediate',
    durationHours: 18,
    url: 'https://www.youtube.com/watch?v=hDKCxebp88A',
    free: true,
    rating: 4.8,
    popularity: 96,
    thumbnail: 'https://img.youtube.com/vi/hDKCxebp88A/hqdefault.jpg',
    description: 'Practical machine learning course covering regression, classification, tree models, unsupervised learning and deployment.'
  },

  // ============================================================
  // ARTIFICIAL INTELLIGENCE / DEEP LEARNING
  // ============================================================

  {
    title: 'Artificial Intelligence: Search Methods for Problem Solving',
    platform: 'NPTEL',
    instructor: 'Prof. Deepak Khemani (IIT Madras)',
    category: 'Artificial Intelligence',
    skills: ['Artificial Intelligence', 'Search Algorithms', 'Problem Solving', 'Algorithms'],
    level: 'Intermediate',
    durationHours: 30,
    url: 'https://www.nptel.ac.in/courses/106106226',
    free: true,
    rating: 4.5,
    popularity: 80,
    thumbnail: 'https://placehold.co/400x225?text=AI+Search',
    description: 'AI course focused on search methods and problem solving, including reasoning and constraint satisfaction concepts.'
  },

  {
    title: 'Deep Learning for Computer Vision',
    platform: 'NPTEL',
    instructor: 'Prof. Vineeth N Balasubramanian (IIT Hyderabad)',
    category: 'Artificial Intelligence',
    skills: ['Deep Learning', 'Computer Vision', 'CNN', 'Object Detection', 'Image Segmentation'],
    level: 'Advanced',
    durationHours: 40,
    url: 'https://www.nptel.ac.in/courses/106106224',
    free: true,
    rating: 4.7,
    popularity: 92,
    thumbnail: 'https://placehold.co/400x225?text=Deep+Learning+CV',
    description: 'Advanced computer vision course covering neural networks, convolutional architectures, detection, segmentation and generative modeling.'
  },

  {
    title: 'Neural Networks for Computer Vision and Natural Language Processing',
    platform: 'NPTEL',
    instructor: 'Prof. Arijit Sur (IIT Guwahati)',
    category: 'Artificial Intelligence',
    skills: ['Neural Networks', 'Computer Vision', 'NLP', 'Transformers', 'Generative AI'],
    level: 'Advanced',
    durationHours: 40,
    url: 'https://www.nptel.ac.in/courses/106103843',
    free: true,
    rating: 4.6,
    popularity: 84,
    thumbnail: 'https://placehold.co/400x225?text=Neural+Networks',
    description: 'Advanced neural network course covering computer vision, NLP, transformers, generative models and multimodal learning.'
  },

  // ============================================================
  // WEB DEVELOPMENT
  // ============================================================

  {
    title: 'React Course - Beginner Tutorial',
    platform: 'YouTube',
    instructor: 'Bob Ziroll / freeCodeCamp.org',
    category: 'Web Development',
    skills: ['React', 'JavaScript', 'JSX', 'Components', 'Hooks'],
    level: 'Beginner',
    durationHours: 12,
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    free: true,
    rating: 4.8,
    popularity: 97,
    thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
    description: 'Beginner React course covering components, JSX, props, state, forms, effects and real-world projects.'
  },

  {
    title: 'Computer Science for Web Programming',
    platform: 'edX',
    instructor: 'Harvard University',
    category: 'Web Development',
    skills: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
    level: 'Intermediate',
    durationHours: 80,
    url: 'https://www.edx.org/learn/computer-science',
    free: false,
    rating: 4.6,
    popularity: 85,
    thumbnail: 'https://placehold.co/400x225?text=Web+Programming',
    description: 'Harvard computer science learning path covering web programming and modern software development concepts.'
  },

  // ============================================================
  // DATABASE
  // ============================================================

  {
    title: 'Computer Science for Databases using SQL',
    platform: 'edX',
    instructor: 'Harvard University',
    category: 'Database',
    skills: ['SQL', 'Database', 'Relational Databases'],
    level: 'Beginner',
    durationHours: 30,
    url: 'https://www.edx.org/learn/computer-science',
    free: false,
    rating: 4.5,
    popularity: 80,
    thumbnail: 'https://placehold.co/400x225?text=SQL+Database',
    description: 'Computer science learning path covering database concepts and SQL.'
  },

  {
    title: 'SQL for Data Analysis',
    platform: 'Coursera',
    instructor: 'University of California, Davis',
    category: 'Database',
    skills: ['SQL', 'Data Analysis', 'Queries', 'Joins'],
    level: 'Beginner',
    durationHours: 25,
    url: 'https://www.coursera.org/learn/sql-for-data-science',
    free: false,
    rating: 4.6,
    popularity: 86,
    thumbnail: 'https://placehold.co/400x225?text=SQL',
    description: 'SQL learning focused on querying, joins, aggregation and analytical scenarios.'
  },

  // ============================================================
  // CYBER SECURITY
  // ============================================================

  {
    title: 'Computer Science for Cybersecurity',
    platform: 'edX',
    instructor: 'Harvard University',
    category: 'Cyber Security',
    skills: ['Cybersecurity', 'Security', 'Computer Science'],
    level: 'Intermediate',
    durationHours: 40,
    url: 'https://www.edx.org/learn/computer-science',
    free: false,
    rating: 4.5,
    popularity: 78,
    thumbnail: 'https://placehold.co/400x225?text=Cybersecurity',
    description: 'Computer science learning path with cybersecurity concepts and security-focused computing.'
  },

  // ============================================================
  // CLOUD COMPUTING
  // ============================================================

  {
    title: 'What is Data Science? - Cloud and Big Data Foundations',
    platform: 'Coursera',
    instructor: 'IBM',
    category: 'Cloud Computing',
    skills: ['Cloud Computing', 'Big Data', 'Data Storage', 'Data Science'],
    level: 'Beginner',
    durationHours: 10,
    url: 'https://www.coursera.org/learn/what-is-datascience',
    free: false,
    rating: 4.7,
    popularity: 75,
    thumbnail: 'https://placehold.co/400x225?text=Cloud+Data',
    description: 'Introductory learning covering cloud concepts, big data, data storage and data science.'
  },

  // ============================================================
  // BUSINESS
  // ============================================================

  {
    title: 'AI for Business Users',
    platform: 'edX',
    instructor: 'Microsoft',
    category: 'Business',
    skills: ['Artificial Intelligence', 'Business', 'AI Applications'],
    level: 'Beginner',
    durationHours: 25,
    url: 'https://www.edx.org/learn/computer-science',
    free: false,
    rating: 4.5,
    popularity: 70,
    thumbnail: 'https://placehold.co/400x225?text=AI+Business',
    description: 'Business-oriented AI learning path focused on understanding and applying artificial intelligence concepts.'
  }
];

const seed = async () => {
  await connectDB();

  await Course.deleteMany({ source: 'seed' });

  await Course.insertMany(
    courses.map(course => ({
      ...course,
      source: 'seed',
      status: 'active',
      lastChecked: new Date()
    }))
  );

  console.log(`Seeded ${courses.length} courses`);

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (adminEmail && adminPassword) {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'SkillHub Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      console.log(`Created admin account for ${adminEmail}`);
    } else {
      console.log(`Admin account already exists for ${adminEmail}`);
    }
  } else {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin creation.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});