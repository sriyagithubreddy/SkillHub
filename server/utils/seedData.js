require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const User = require('../models/User');

const courses = [
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
    description: 'Beginner Python course covering variables, strings, lists, functions, loops, files, classes and programming fundamentals.'
  },

  {
    title: 'Machine Learning with Python and Scikit-Learn',
    platform: 'YouTube',
    instructor: 'freeCodeCamp.org',
    category: 'Machine Learning',
    skills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Regression', 'Classification'],
    level: 'Intermediate',
    durationHours: 18,
    url: 'https://www.youtube.com/watch?v=hDKCxebp88A',
    free: true,
    rating: 4.8,
    popularity: 96,
    thumbnail: 'https://img.youtube.com/vi/hDKCxebp88A/hqdefault.jpg',
    description: 'Practical machine learning course covering regression, classification, tree models and unsupervised learning.'
  },

  {
    title: 'React Course - Beginner Tutorial',
    platform: 'YouTube',
    instructor: 'Bob Ziroll',
    category: 'Web Development',
    skills: ['React', 'JavaScript', 'JSX', 'Components', 'Hooks'],
    level: 'Beginner',
    durationHours: 12,
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    free: true,
    rating: 4.8,
    popularity: 97,
    thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
    description: 'Beginner React course covering components, JSX, props, state, forms and effects.'
  },

  {
    title: 'Introduction to Artificial Intelligence',
    platform: 'SWAYAM',
    instructor: 'SWAYAM / IIT faculty',
    category: 'Artificial Intelligence',
    skills: ['Artificial Intelligence', 'Problem Solving', 'Algorithms'],
    level: 'Beginner',
    durationHours: 30,
    url: 'https://swayam.gov.in/',
    free: true,
    rating: 4.5,
    popularity: 80,
    thumbnail: 'https://placehold.co/400x225?text=SWAYAM+AI',
    description: 'Free learning resource for understanding artificial intelligence concepts and problem-solving approaches.'
  },

  {
    title: 'Introduction to Data Science',
    platform: 'SWAYAM',
    instructor: 'SWAYAM / IIT faculty',
    category: 'Data Science',
    skills: ['Data Science', 'Statistics', 'Data Analysis'],
    level: 'Beginner',
    durationHours: 30,
    url: 'https://swayam.gov.in/',
    free: true,
    rating: 4.5,
    popularity: 78,
    thumbnail: 'https://placehold.co/400x225?text=SWAYAM+Data+Science',
    description: 'Free introductory learning resource covering data science and data analysis fundamentals.'
  },

  {
    title: 'Python Programming Fundamentals',
    platform: 'freeCodeCamp',
    instructor: 'freeCodeCamp',
    category: 'Programming',
    skills: ['Python', 'Programming Fundamentals'],
    level: 'Beginner',
    durationHours: 20,
    url: 'https://www.freecodecamp.org/learn/',
    free: true,
    rating: 4.8,
    popularity: 95,
    thumbnail: 'https://placehold.co/400x225?text=freeCodeCamp+Python',
    description: 'Free self-paced programming resources covering Python and programming fundamentals.'
  },

  {
    title: 'Responsive Web Design',
    platform: 'freeCodeCamp',
    instructor: 'freeCodeCamp',
    category: 'Web Development',
    skills: ['HTML', 'CSS', 'Responsive Design', 'Web Development'],
    level: 'Beginner',
    durationHours: 20,
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    free: true,
    rating: 4.8,
    popularity: 96,
    thumbnail: 'https://placehold.co/400x225?text=Responsive+Web+Design',
    description: 'Free certification curriculum covering HTML, CSS and responsive web design.'
  },

  {
    title: 'SQL and Relational Database',
    platform: 'freeCodeCamp',
    instructor: 'freeCodeCamp',
    category: 'Database',
    skills: ['SQL', 'Relational Database', 'Database'],
    level: 'Beginner',
    durationHours: 20,
    url: 'https://www.freecodecamp.org/learn/relational-database/',
    free: true,
    rating: 4.8,
    popularity: 90,
    thumbnail: 'https://placehold.co/400x225?text=SQL+Database',
    description: 'Free database curriculum covering SQL and relational database concepts.'
  },

  {
    title: 'Introduction to Cybersecurity',
    platform: 'Cisco Skills for All',
    instructor: 'Cisco',
    category: 'Cyber Security',
    skills: ['Cybersecurity', 'Network Security', 'Digital Safety'],
    level: 'Beginner',
    durationHours: 6,
    url: 'https://skillsforall.com/',
    free: true,
    rating: 4.6,
    popularity: 88,
    thumbnail: 'https://placehold.co/400x225?text=Cisco+Cybersecurity',
    description: 'Free cybersecurity learning resource from Cisco Skills for All.'
  },

  {
    title: 'Networking Basics',
    platform: 'Cisco Skills for All',
    instructor: 'Cisco',
    category: 'Cloud Computing',
    skills: ['Networking', 'TCP/IP', 'Network Fundamentals'],
    level: 'Beginner',
    durationHours: 25,
    url: 'https://skillsforall.com/',
    free: true,
    rating: 4.7,
    popularity: 86,
    thumbnail: 'https://placehold.co/400x225?text=Cisco+Networking',
    description: 'Free networking fundamentals learning resource from Cisco Skills for All.'
  },

  {
    title: 'Introduction to Computer Science',
    platform: 'MIT OpenCourseWare',
    instructor: 'MIT OpenCourseWare',
    category: 'Programming',
    skills: ['Computer Science', 'Programming', 'Algorithms'],
    level: 'Beginner',
    durationHours: 40,
    url: 'https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science',
    free: true,
    rating: 4.8,
    popularity: 92,
    thumbnail: 'https://placehold.co/400x225?text=MIT+OpenCourseWare',
    description: 'Free MIT OpenCourseWare computer science learning resources.'
  },

  {
    title: 'Introduction to Machine Learning',
    platform: 'MIT OpenCourseWare',
    instructor: 'MIT OpenCourseWare',
    category: 'Machine Learning',
    skills: ['Machine Learning', 'Artificial Intelligence', 'Statistics'],
    level: 'Intermediate',
    durationHours: 40,
    url: 'https://ocw.mit.edu/search/?q=machine%20learning',
    free: true,
    rating: 4.8,
    popularity: 90,
    thumbnail: 'https://placehold.co/400x225?text=MIT+Machine+Learning',
    description: 'Free MIT OpenCourseWare resources for studying machine learning and related concepts.'
  }
];

const seed = async () => {
  try {
    await connectDB();

    await Course.deleteMany({
      source: 'seed'
    });

    await Course.insertMany(
      courses.map(course => ({
        ...course,
        source: 'seed',
        status: 'active',
        lastChecked: new Date()
      }))
    );

    console.log(`Seeded ${courses.length} free fallback courses.`);

    const adminEmail = String(
      process.env.ADMIN_EMAIL || ''
    ).trim().toLowerCase();

    const adminPassword = String(
      process.env.ADMIN_PASSWORD || ''
    );

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({
        email: adminEmail
      });

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
      console.log(
        'ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin creation.'
      );
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
