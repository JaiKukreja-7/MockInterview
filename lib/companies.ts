export interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  domain: string;
  region: 'Indian' | 'Global';
  description: string;
  interviewTips: string[];
  questionCount: number;
}

export const COMPANIES: CompanyInfo[] = [
  // Indian Companies
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://logo.clearbit.com/flipkart.com',
    domain: 'flipkart.com',
    region: 'Indian',
    description: 'Flipkart is India\'s leading e-commerce marketplace. Their interviews typically include 3-4 rounds covering DSA, System Design, and HR. Expect medium-to-hard DSA problems focusing on arrays, trees, and dynamic programming. System design rounds often involve designing e-commerce features at scale.',
    interviewTips: [
      'Focus on optimization — Flipkart values efficient solutions with good time/space complexity.',
      'Prepare for system design questions involving high-throughput e-commerce systems.',
      'Be ready to discuss your approach to handling scale (millions of users and products).',
      'Practice problems on dynamic programming and graph algorithms — frequently asked.'
    ],
    questionCount: 20,
  },
  {
    id: 'paytm',
    name: 'Paytm',
    logo: 'https://logo.clearbit.com/paytm.com',
    domain: 'paytm.com',
    region: 'Indian',
    description: 'Paytm is India\'s largest digital payments platform. Interviews focus heavily on backend engineering and DSA. Expect questions about payment systems, concurrency, and distributed systems. Typically 2-3 coding rounds followed by a system design and hiring manager round.',
    interviewTips: [
      'Understand payment processing flows and financial transaction concepts.',
      'Backend questions often involve concurrency, caching, and database design.',
      'DSA rounds frequently test arrays, strings, and linked list problems.',
      'Be prepared to discuss idempotency and transaction safety in system design.'
    ],
    questionCount: 15,
  },
  {
    id: 'zomato',
    name: 'Zomato',
    logo: 'https://logo.clearbit.com/zomato.com',
    domain: 'zomato.com',
    region: 'Indian',
    description: 'Zomato is India\'s largest food delivery and restaurant discovery platform. Interviews include DSA coding rounds and system design. They emphasize real-world problem solving — expect questions involving geo-location algorithms, recommendation systems, and delivery optimization.',
    interviewTips: [
      'Focus on graph algorithms and shortest path — relevant to delivery routing.',
      'System design questions often involve food delivery, restaurant search, or recommendation engines.',
      'Practice problems involving sorting, searching, and geospatial data structures.',
      'Demonstrate understanding of real-time systems and event-driven architectures.'
    ],
    questionCount: 15,
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    logo: 'https://logo.clearbit.com/swiggy.com',
    domain: 'swiggy.com',
    region: 'Indian',
    description: 'Swiggy is a leading on-demand delivery platform in India. Their engineering interviews focus on backend systems and DSA. Expect problems related to logistics, real-time tracking, and high-availability systems. Typically 2 DSA rounds, 1 system design, and 1 hiring manager round.',
    interviewTips: [
      'Prepare for problems involving queue/stack operations and graph traversal.',
      'Backend questions often cover microservices architecture and API design.',
      'System design rounds frequently involve designing delivery tracking or order management systems.',
      'Focus on writing clean, well-structured code — Swiggy values code quality.'
    ],
    questionCount: 15,
  },
  {
    id: 'cred',
    name: 'CRED',
    logo: 'https://logo.clearbit.com/cred.club',
    domain: 'cred.club',
    region: 'Indian',
    description: 'CRED is a fintech platform for credit card bill payments and rewards. Known for their high engineering bar, interviews focus on DSA and frontend development. Expect clean UI/UX discussions, React/JS deep dives, and medium-hard DSA problems.',
    interviewTips: [
      'Frontend roles: Deep knowledge of React, state management, and performance optimization is crucial.',
      'DSA problems tend to be medium-hard, focusing on arrays, strings, and trees.',
      'Be ready to discuss component architecture and design system implementation.',
      'CRED values craft — show attention to detail in both code and communication.'
    ],
    questionCount: 10,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: 'https://logo.clearbit.com/razorpay.com',
    domain: 'razorpay.com',
    region: 'Indian',
    description: 'Razorpay is India\'s leading payment gateway and financial services company. Interviews are rigorous with focus on DSA and system design. Expect questions about payment processing, distributed systems, and database design. Typically 3-4 technical rounds.',
    interviewTips: [
      'Understand financial domain concepts — payment gateways, reconciliation, webhooks.',
      'System design questions often involve designing payment processing pipelines.',
      'DSA rounds focus on medium-hard problems — practice hash maps, trees, and DP.',
      'Demonstrate knowledge of database transactions, ACID properties, and consistency models.'
    ],
    questionCount: 15,
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: 'https://logo.clearbit.com/infosys.com',
    domain: 'infosys.com',
    region: 'Indian',
    description: 'Infosys is one of India\'s largest IT services companies. Interviews for freshers include aptitude tests, coding rounds (usually easy-medium DSA), and HR interviews. The process emphasizes fundamentals — OOP, DBMS, OS, and basic data structures.',
    interviewTips: [
      'Focus on fundamentals — OOP concepts, basic data structures, and sorting algorithms.',
      'HR rounds ask about teamwork, leadership, and adaptability — prepare STAR format answers.',
      'Coding problems are typically easy to medium difficulty.',
      'Brush up on DBMS (SQL queries, normalization) and OS concepts (processes, threads, memory).'
    ],
    questionCount: 10,
  },
  {
    id: 'tcs',
    name: 'TCS',
    logo: 'https://logo.clearbit.com/tcs.com',
    domain: 'tcs.com',
    region: 'Indian',
    description: 'Tata Consultancy Services (TCS) is a global IT services leader. The interview process includes an aptitude test (TCS NQT), coding round, technical interview, and HR round. Questions focus on basics — data structures, algorithms, OOP, and HR behavioral questions.',
    interviewTips: [
      'Practice TCS NQT pattern questions — aptitude, logical reasoning, and basic coding.',
      'Technical interviews focus on fundamentals — expect questions on arrays, strings, and OOP.',
      'HR rounds are important — prepare answers about your goals, strengths, and why TCS.',
      'Know your resume thoroughly — be ready to discuss all projects in detail.'
    ],
    questionCount: 10,
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: 'https://logo.clearbit.com/wipro.com',
    domain: 'wipro.com',
    region: 'Indian',
    description: 'Wipro is a leading global information technology company. Their interview process includes aptitude assessment, technical interview (DSA + CS fundamentals), and HR round. Questions are typically easy to medium difficulty focusing on core programming concepts.',
    interviewTips: [
      'Focus on basic DSA — arrays, strings, linked lists, and simple tree problems.',
      'Be well-versed in at least one programming language (Java, Python, or C++).',
      'HR questions often focus on adaptability, willingness to relocate, and teamwork.',
      'Review DBMS and networking basics — commonly asked in technical rounds.'
    ],
    questionCount: 10,
  },
  // Global Companies
  {
    id: 'google',
    name: 'Google',
    logo: 'https://logo.clearbit.com/google.com',
    domain: 'google.com',
    region: 'Global',
    description: 'Google\'s interview process is famously rigorous, involving 4-5 rounds of coding and system design. Expect medium-to-hard algorithmic problems heavily focusing on graphs, dynamic programming, and optimization. System design rounds test ability to design at Google scale (billions of users).',
    interviewTips: [
      'Master graph algorithms (BFS, DFS, Dijkstra) and dynamic programming — Google\'s favorites.',
      'Always communicate your thought process — Google evaluates how you think, not just the answer.',
      'For system design, focus on scalability, fault tolerance, and data consistency.',
      'Practice on LeetCode medium/hard problems — aim for optimal time complexity.'
    ],
    questionCount: 20,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    domain: 'amazon.com',
    region: 'Global',
    description: 'Amazon interviews heavily emphasize their 16 Leadership Principles alongside technical ability. Expect 4-5 rounds mixing DSA coding, system design, and behavioral (LP) questions. Every interview includes at least one behavioral question using the STAR method.',
    interviewTips: [
      'Learn all 16 Leadership Principles and prepare 2-3 STAR stories for each.',
      'DSA questions frequently involve arrays, trees, graphs, and BFS/DFS.',
      'System design rounds test distributed systems — design for scale and availability.',
      'Always tie behavioral answers back to specific Leadership Principles.',
      '"Customer Obsession", "Ownership", and "Bias for Action" are the most commonly tested LPs.'
    ],
    questionCount: 20,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    domain: 'microsoft.com',
    region: 'Global',
    description: 'Microsoft interviews typically involve 4-5 rounds of coding and system design. They value clean code, strong fundamentals, and the ability to optimize solutions. Expect a mix of medium-difficulty DSA problems and system design questions focused on cloud services and enterprise software.',
    interviewTips: [
      'Focus on writing clean, bug-free code — Microsoft values code quality over speed.',
      'Practice array, string, tree, and graph problems — most commonly asked categories.',
      'System design questions often involve cloud services, storage systems, or collaboration tools.',
      'Be prepared to optimize your initial solution — interviewers often ask for improvements.'
    ],
    questionCount: 15,
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: 'https://logo.clearbit.com/meta.com',
    domain: 'meta.com',
    region: 'Global',
    description: 'Meta (formerly Facebook) interviews focus on coding speed and system design at scale. Expect 2 coding rounds (45 min each, solve 2 problems per round) and 1 system design round. Problems are typically medium difficulty but require fast, optimal solutions.',
    interviewTips: [
      'Speed is critical — practice solving 2 medium LeetCode problems in 45 minutes.',
      'Focus on arrays, strings, graphs, and tree problems — Meta\'s most common categories.',
      'System design questions involve designing social media features at massive scale.',
      'Practice articulating your approach quickly — Meta values clear communication under time pressure.'
    ],
    questionCount: 15,
  },
  {
    id: 'adobe',
    name: 'Adobe',
    logo: 'https://logo.clearbit.com/adobe.com',
    domain: 'adobe.com',
    region: 'Global',
    description: 'Adobe interviews include coding rounds, system design, and sometimes frontend-specific rounds for relevant roles. They value creative problem solving and strong CS fundamentals. Expect medium-difficulty DSA problems and questions about UI/UX implementation.',
    interviewTips: [
      'For frontend roles, know React deeply — component lifecycle, hooks, state management, and performance.',
      'DSA problems are typically medium difficulty — practice arrays, strings, DP, and tree traversals.',
      'Adobe values creative approaches — don\'t hesitate to propose unconventional solutions.',
      'Be prepared for questions about responsive design, accessibility, and cross-browser compatibility.'
    ],
    questionCount: 10,
  },
];

export const INDIAN_COMPANIES = COMPANIES.filter(c => c.region === 'Indian');
export const GLOBAL_COMPANIES = COMPANIES.filter(c => c.region === 'Global');

export function getCompanyById(id: string): CompanyInfo | undefined {
  return COMPANIES.find(c => c.id === id);
}

export function getCompanyByName(name: string): CompanyInfo | undefined {
  return COMPANIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}
