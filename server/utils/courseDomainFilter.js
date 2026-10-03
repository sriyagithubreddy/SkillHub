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

const DOMAIN_RULES = [
  {
    category: 'Machine Learning',
    strong: [
      'machine learning',
      'deep learning',
      'reinforcement learning',
      'neural network',
      'neural networks',
      'supervised learning',
      'unsupervised learning',
      'mlops',
      'computer vision'
    ],
    supporting: [
      'tensorflow',
      'pytorch',
      'scikit learn',
      'scikit-learn',
      'classification',
      'regression',
      'clustering'
    ]
  },
  {
    category: 'Artificial Intelligence',
    strong: [
      'artificial intelligence',
      'generative ai',
      'generative artificial intelligence',
      'large language model',
      'large language models',
      'natural language processing',
      'nlp',
      'natural language understanding',
      'ai applications',
      'ai application',
      'intelligent systems'
    ],
    supporting: [
      'llm',
      'openai',
      'azure openai',
      'prompt engineering',
      'generative model',
      'chatbot',
      'transformer models',
      'transformers'
    ]
  },
  {
    category: 'Data Science',
    strong: [
      'data science',
      'data scientist',
      'data analytics',
      'data analysis',
      'data mining',
      'data visualization',
      'big data',
      'business intelligence',
      'statistical analysis',
      'data storytelling'
    ],
    supporting: [
      'power bi',
      'tableau',
      'pandas',
      'numpy',
      'matplotlib',
      'seaborn',
      'statistics',
      'analytics'
    ]
  },
  {
    category: 'Cyber Security',
    strong: [
      'cyber security',
      'cybersecurity',
      'information security',
      'network security',
      'application security',
      'cloud security',
      'ethical hacking',
      'penetration testing',
      'digital forensics',
      'security operations',
      'security analyst',
      'soc analyst',
      'incident response',
      'malware analysis',
      'cryptography'
    ],
    supporting: [
      'firewall',
      'vulnerability',
      'vulnerabilities',
      'threat detection',
      'identity security',
      'zero trust'
    ]
  },
  {
    category: 'Cloud Computing',
    strong: [
      'cloud computing',
      'cloud architecture',
      'cloud infrastructure',
      'cloud platform',
      'cloud services',
      'cloud engineering',
      'cloud administration',
      'aws cloud',
      'amazon web services',
      'microsoft azure',
      'google cloud',
      'google cloud platform',
      'gcp cloud'
    ],
    supporting: [
      'aws',
      'azure',
      'gcp',
      'docker',
      'kubernetes',
      'serverless',
      'virtual machines',
      'cloud deployment'
    ]
  },
  {
    category: 'Database',
    strong: [
      'database',
      'databases',
      'database management',
      'database systems',
      'relational database',
      'relational databases',
      'database design',
      'database administration',
      'sql database',
      'nosql database',
      'dbms'
    ],
    supporting: [
      'sql',
      'mysql',
      'postgresql',
      'postgres',
      'mongodb',
      'nosql',
      'oracle database',
      'redis',
      'database normalization'
    ]
  },
  {
    category: 'Web Development',
    strong: [
      'web development',
      'web application development',
      'web programming',
      'frontend development',
      'front end development',
      'backend development',
      'back end development',
      'full stack development',
      'full-stack development',
      'web design and development'
    ],
    supporting: [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'angular',
      'vue',
      'node.js',
      'node js',
      'express.js',
      'express js'
    ]
  },
  {
    category: 'App Development',
    strong: [
      'app development',
      'application development',
      'mobile application development',
      'mobile app development',
      'android development',
      'ios development',
      'mobile development',
      'flutter development',
      'react native development'
    ],
    supporting: [
      'android',
      'ios',
      'flutter',
      'react native',
      'kotlin',
      'swift'
    ]
  },
  {
    category: 'UI/UX',
    strong: [
      'ui ux',
      'ui/ux',
      'user interface design',
      'user experience design',
      'ux design',
      'ui design',
      'interaction design',
      'product design'
    ],
    supporting: [
      'figma',
      'wireframing',
      'prototyping',
      'usability',
      'design systems'
    ]
  },
  {
    category: 'Programming',
    strong: [
      'programming',
      'computer programming',
      'programming fundamentals',
      'programming language',
      'coding',
      'software development',
      'software engineering',
      'data structures and algorithms',
      'data structures algorithms',
      'algorithms and data structures'
    ],
    supporting: [
      'python programming',
      'java programming',
      'c programming',
      'c++ programming',
      'c# programming',
      'javascript programming',
      'typescript programming',
      'python',
      'java',
      'c++',
      'c#',
      'algorithms',
      'data structures',
      'git',
      'github',
      'bash',
      'powershell'
    ]
  },
  {
    category: 'Business',
    strong: [
      'business management',
      'business administration',
      'business strategy',
      'digital marketing',
      'marketing management',
      'financial management',
      'accounting',
      'entrepreneurship',
      'product management',
      'project management',
      'business analytics',
      'leadership management'
    ],
    supporting: [
      'marketing',
      'finance',
      'leadership',
      'management',
      'commerce',
      'entrepreneurship'
    ]
  },
  {
    category: 'Communication',
    strong: [
      'communication skills',
      'professional communication',
      'business communication',
      'technical communication',
      'english communication',
      'presentation skills',
      'public speaking',
      'interpersonal skills',
      'soft skills',
      'writing skills',
      'professional writing'
    ],
    supporting: [
      'communication',
      'presentation',
      'speaking',
      'writing',
      'english'
    ]
  }
];

const EXCLUDED_DOMAINS = [
  'agriculture',
  'agricultural',
  'civil engineering',
  'mechanical engineering',
  'electrical engineering',
  'electronics engineering',
  'chemical engineering',
  'biotechnology',
  'medicine',
  'medical',
  'nursing',
  'pharmacy',
  'law',
  'legal studies',
  'physics',
  'chemistry',
  'biology',
  'geology',
  'astronomy',
  'history',
  'political science',
  'sociology',
  'literature',
  'architecture',
  'fashion design',
  'food technology',
  'textile engineering',
  'automobile engineering'
];

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/[^a-z0-9+#./ -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPhrase(text, phrase) {
  return text.includes(
    normalizeText(phrase)
  );
}

function getCourseText(course = {}) {
  return {
    title: normalizeText(course.title),
    description: normalizeText(course.description),
    instructor: normalizeText(course.instructor),
    skills: Array.isArray(course.skills)
      ? course.skills
          .map(normalizeText)
          .filter(Boolean)
      : []
  };
}

function hasExcludedDomain(title, description) {
  return EXCLUDED_DOMAINS.find(
    keyword =>
      containsPhrase(title, keyword) ||
      containsPhrase(description, keyword)
  );
}

function classifyCourse(course = {}) {
  const {
    title,
    description,
    skills
  } = getCourseText(course);

  if (!title && !description && !skills.length) {
    return {
      accepted: false,
      category: null,
      reason: 'empty-content'
    };
  }

  /*
   * Excluded domains have priority.
   *
   * Example:
   * "Medical Data Analysis" must NOT become
   * Data Science merely because "data analysis"
   * is present.
   */
  const excluded =
    hasExcludedDomain(
      title,
      description
    );

  if (excluded) {
    return {
      accepted: false,
      category: null,
      reason:
        `excluded-domain:${excluded}`
    };
  }

  const titleMatches = [];
  const supportingMatches = [];

  for (const rule of DOMAIN_RULES) {
    const strongTitleMatches =
      rule.strong.filter(
        keyword =>
          title &&
          containsPhrase(
            title,
            keyword
          )
      );

    if (strongTitleMatches.length) {
      titleMatches.push({
        category: rule.category,
        strong: strongTitleMatches
      });

      continue;
    }

    const evidence = [
      ...rule.strong,
      ...rule.supporting
    ].filter(keyword => {
      if (
        description &&
        containsPhrase(
          description,
          keyword
        )
      ) {
        return true;
      }

      return skills.some(skill =>
        containsPhrase(
          skill,
          keyword
        )
      );
    });

    if (evidence.length) {
      supportingMatches.push({
        category: rule.category,
        supporting: [
          ...new Set(evidence)
        ]
      });
    }
  }

  /*
   * A clear title match is strong evidence.
   */
  if (titleMatches.length === 1) {
    return {
      accepted: true,
      category:
        titleMatches[0].category,
      reason:
        'strong-title-match'
    };
  }

  /*
   * Multiple strong title matches are
   * considered ambiguous unless supporting
   * evidence resolves the conflict.
   */
  if (titleMatches.length > 1) {
    const resolved =
      titleMatches.filter(match =>
        supportingMatches.some(
          supporting =>
            supporting.category ===
            match.category
        )
      );

    if (resolved.length === 1) {
      return {
        accepted: true,
        category:
          resolved[0].category,
        reason:
          'resolved-title-match'
      };
    }

    return {
      accepted: false,
      category: null,
      reason:
        'ambiguous-title-domain'
    };
  }

  /*
   * Without a strong title match, require
   * at least TWO pieces of domain evidence.
   */
  const ranked =
    supportingMatches
      .map(match => ({
        ...match,
        score:
          match.supporting.length
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  if (!ranked.length) {
    return {
      accepted: false,
      category: null,
      reason:
        'no-supported-domain'
    };
  }

  if (ranked[0].score < 2) {
    return {
      accepted: false,
      category: null,
      reason:
        'insufficient-domain-evidence'
    };
  }

  if (
    ranked.length > 1 &&
    ranked[0].score ===
      ranked[1].score
  ) {
    return {
      accepted: false,
      category: null,
      reason:
        'ambiguous-domain'
    };
  }

  return {
    accepted: true,
    category:
      ranked[0].category,
    reason:
      'strong-supporting-evidence'
  };
}

function filterCourse(course = {}) {
  const result =
    classifyCourse(course);

  if (!result.accepted) {
    return null;
  }

  return {
    ...course,
    category:
      result.category,
    free: true
  };
}

module.exports = {
  ALLOWED_CATEGORIES,
  classifyCourse,
  filterCourse
};
