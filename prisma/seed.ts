import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const institutions = [
  { name: 'TechVerse University', shortName: 'TVU', location: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', type: 'UNIVERSITY' as const, verified: true, description: 'A premier technology university in Mumbai' },
  { name: 'Apex Engineering College', shortName: 'AEC', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', type: 'ENGINEERING_COLLEGE' as const, verified: true, description: 'Leading engineering college in Bangalore' },
  { name: 'Nova Institute of Technology', shortName: 'NIT', location: 'Delhi', city: 'New Delhi', state: 'Delhi', type: 'RESEARCH_INSTITUTE' as const, verified: true, description: 'Research-focused institute in Delhi' },
  { name: 'Meridian University', shortName: 'MU', location: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', type: 'UNIVERSITY' as const, verified: true, description: 'Innovation-driven university in Chennai' },
  { name: 'Stellar College of Engineering', shortName: 'SCE', location: 'Pune', city: 'Pune', state: 'Maharashtra', type: 'ENGINEERING_COLLEGE' as const, verified: true, description: 'Top engineering college in Pune' },
  { name: 'Pacific Tech University', shortName: 'PTU', location: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', type: 'UNIVERSITY' as const, verified: false, description: 'Technology university in Hyderabad' },
  { name: 'Horizon Academy', shortName: 'HA', location: 'Kolkata', city: 'Kolkata', state: 'West Bengal', type: 'ENGINEERING_COLLEGE' as const, verified: true, description: 'Academic excellence in Kolkata' },
  { name: 'Summit Institute of Technology', shortName: 'SIT', location: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', type: 'ENGINEERING_COLLEGE' as const, verified: true, description: 'Growing tech institute in Ahmedabad' },
]

const projectData = [
  // AI / Agriculture cluster
  {
    title: 'CropGuard: Plant Disease Detection using Deep CNN',
    abstract: 'An AI-powered system that uses Convolutional Neural Networks to detect and classify plant diseases from leaf images with 94% accuracy, enabling early intervention for farmers.',
    problemStatement: 'Crop diseases cause massive losses for farmers who lack timely diagnosis. Manual inspection by experts is slow and expensive, especially in rural areas.',
    objectives: JSON.stringify(['Build CNN model for plant disease classification', 'Achieve 90%+ accuracy on PlantVillage dataset', 'Create mobile-friendly interface for farmers', 'Support offline inference on edge devices']),
    domain: 'Artificial Intelligence',
    subdomain: 'Computer Vision',
    technologies: JSON.stringify(['Python', 'TensorFlow', 'Keras', 'OpenCV', 'React Native', 'FastAPI']),
    skills: JSON.stringify(['Deep Learning', 'Image Classification', 'Mobile Development', 'REST API']),
    methodology: 'Transfer learning using ResNet50 pre-trained on ImageNet, fine-tuned on PlantVillage dataset with 54,000+ images across 38 disease categories.',
    architecture: 'Mobile app → REST API → CNN inference engine → Disease database → Recommendation system',
    dataset: 'PlantVillage Dataset (54,000+ leaf images, 38 classes)',
    expectedOutcome: 'Real-time plant disease detection app with treatment recommendations',
    futureScope: 'Expand to more crops, add IoT sensor integration, multilingual support',
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    githubUrl: 'https://github.com/demo/cropguard',
    lookingFor: JSON.stringify(['IoT expertise', 'Mobile development', 'Agricultural domain expert']),
    tags: JSON.stringify(['AI', 'Agriculture', 'CNN', 'Plant Disease', 'Computer Vision']),
  },
  {
    title: 'AgriSense: Smart Crop Monitoring with IoT and ML',
    abstract: 'An integrated IoT and machine learning platform for continuous crop health monitoring using soil sensors, weather data, and satellite imagery to predict optimal harvest time.',
    problemStatement: 'Farmers lack real-time data about crop health, leading to suboptimal yields and resource waste.',
    objectives: JSON.stringify(['Deploy IoT sensor network in fields', 'Integrate satellite imagery analysis', 'ML model for yield prediction', 'Dashboard for farmers']),
    domain: 'Artificial Intelligence',
    subdomain: 'IoT + ML',
    technologies: JSON.stringify(['Python', 'Raspberry Pi', 'MQTT', 'TensorFlow', 'React', 'Node.js', 'MongoDB']),
    skills: JSON.stringify(['IoT', 'Machine Learning', 'Sensor Networks', 'Data Analytics']),
    methodology: 'IoT sensors collect soil moisture, temperature, pH data. ML models analyze trends combined with satellite NDVI indices.',
    dataset: 'Custom sensor data from 5 farms over 6 months',
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['IoT', 'Agriculture', 'Machine Learning', 'Sensors', 'Crop Monitoring']),
    lookingFor: JSON.stringify(['Agriculture expert', 'Hardware engineer']),
  },
  {
    title: 'FarmAI: Precision Agriculture using Computer Vision and Drones',
    abstract: 'Drone-based crop monitoring system that uses computer vision to identify pest infestations, water stress, and nutrient deficiencies at field scale.',
    problemStatement: 'Large-scale farms cannot manually inspect every section. Pest infestations and deficiencies spread before detection.',
    objectives: JSON.stringify(['Drone flight path automation', 'Real-time image analysis', 'Pest and disease detection', 'Generate field health maps']),
    domain: 'Artificial Intelligence',
    subdomain: 'Drone + Computer Vision',
    technologies: JSON.stringify(['Python', 'OpenCV', 'YOLOv8', 'ArduPilot', 'React', 'PostgreSQL']),
    skills: JSON.stringify(['Computer Vision', 'Drone Programming', 'Object Detection', 'GIS']),
    methodology: 'YOLOv8 trained on custom drone imagery dataset for multi-label detection of crop issues.',
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    tags: JSON.stringify(['Drones', 'Agriculture', 'Computer Vision', 'YOLO', 'Precision Agriculture']),
    lookingFor: JSON.stringify(['Hardware engineer', 'GIS specialist']),
  },
  // Healthcare cluster
  {
    title: 'MediScan: AI Diagnosis Support for Chest X-Ray Analysis',
    abstract: 'Deep learning system for automated chest X-ray interpretation that detects pneumonia, COVID-19, and tuberculosis with radiologist-level accuracy.',
    problemStatement: 'Radiology departments face a shortage of radiologists, leading to delayed diagnosis in critical conditions.',
    objectives: JSON.stringify(['Train multi-class classification model', 'Achieve AUC > 0.95', 'Integrate with hospital PACS systems', 'Generate AI-assisted diagnostic reports']),
    domain: 'Healthcare',
    subdomain: 'Medical Imaging',
    technologies: JSON.stringify(['Python', 'PyTorch', 'DenseNet', 'DICOM', 'FastAPI', 'React', 'PostgreSQL']),
    skills: JSON.stringify(['Deep Learning', 'Medical Imaging', 'DICOM', 'Healthcare AI']),
    methodology: 'DenseNet-121 trained on ChestX-ray14 dataset with 112,000 X-ray images across 14 pathology classes.',
    dataset: 'NIH ChestX-ray14 (112,000 images)',
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    githubUrl: 'https://github.com/demo/mediscan',
    tags: JSON.stringify(['Healthcare', 'AI', 'Medical Imaging', 'X-Ray', 'Diagnosis']),
    lookingFor: JSON.stringify(['Medical professional', 'Backend developer']),
  },
  {
    title: 'HealthBridge: Telemedicine Platform for Rural Healthcare',
    abstract: 'A comprehensive telemedicine platform connecting rural patients with specialist doctors through video consultation, AI symptom analysis, and prescription management.',
    problemStatement: 'Rural populations lack access to specialist medical care due to geographic and financial barriers.',
    objectives: JSON.stringify(['Video consultation system', 'AI symptom checker', 'E-prescription module', 'Pharmacy integration']),
    domain: 'Healthcare',
    subdomain: 'Telemedicine',
    technologies: JSON.stringify(['React', 'Node.js', 'WebRTC', 'NLP', 'PostgreSQL', 'Twilio']),
    skills: JSON.stringify(['WebRTC', 'Full Stack', 'NLP', 'Healthcare Systems']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Healthcare', 'Telemedicine', 'Rural', 'WebRTC', 'NLP']),
    lookingFor: JSON.stringify(['UI/UX designer', 'Medical consultant']),
  },
  {
    title: 'NeuralDoc: Automated Medical Report Generation using NLP',
    abstract: 'NLP-powered system that generates structured medical reports from doctor-patient conversation transcripts using fine-tuned transformer models.',
    problemStatement: 'Doctors spend significant time on documentation, reducing time available for patient care.',
    objectives: JSON.stringify(['Speech-to-text transcription', 'Medical entity extraction', 'Structured report generation', 'EHR system integration']),
    domain: 'Healthcare',
    subdomain: 'NLP',
    technologies: JSON.stringify(['Python', 'Transformers', 'BERT', 'spaCy', 'FastAPI', 'React']),
    skills: JSON.stringify(['NLP', 'Transformer Models', 'Medical NLP', 'Speech Processing']),
    status: 'APPROVED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['NLP', 'Healthcare', 'Transformers', 'Medical Reports', 'Automation']),
    lookingFor: JSON.stringify(['Healthcare domain expert', 'Data annotator']),
  },
  // Smart Cities cluster
  {
    title: 'TrafficFlow: AI-Powered Adaptive Traffic Signal Control',
    abstract: 'Reinforcement learning system that dynamically controls traffic signals based on real-time vehicle density, reducing average wait times by 35%.',
    problemStatement: 'Fixed-timing traffic signals are inefficient in handling variable traffic patterns, causing congestion and delays.',
    objectives: JSON.stringify(['Real-time traffic density estimation', 'RL agent for signal control', 'Simulation environment', 'Hardware prototype']),
    domain: 'Smart Cities',
    subdomain: 'Traffic Management',
    technologies: JSON.stringify(['Python', 'Reinforcement Learning', 'SUMO Simulator', 'OpenCV', 'Raspberry Pi', 'React']),
    skills: JSON.stringify(['Reinforcement Learning', 'Computer Vision', 'IoT', 'Simulation']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    githubUrl: 'https://github.com/demo/trafficflow',
    tags: JSON.stringify(['Smart Cities', 'Traffic', 'Reinforcement Learning', 'IoT', 'Optimization']),
    lookingFor: JSON.stringify(['Civil engineer', 'RL researcher']),
  },
  {
    title: 'SmartWaste: Intelligent Waste Management using IoT and ML',
    abstract: 'Smart bin system with fill-level sensors and ML-powered route optimization for waste collection vehicles, reducing collection costs by 40%.',
    problemStatement: 'Municipal waste collection follows fixed routes regardless of bin fill levels, wasting fuel and labor.',
    objectives: JSON.stringify(['IoT sensor deployment in bins', 'Route optimization algorithm', 'Dashboard for municipality', 'Alert system for overflowing bins']),
    domain: 'Smart Cities',
    subdomain: 'Waste Management',
    technologies: JSON.stringify(['Arduino', 'MQTT', 'Python', 'Dijkstra/TSP', 'React', 'Node.js', 'MongoDB']),
    skills: JSON.stringify(['IoT', 'Route Optimization', 'Algorithms', 'Dashboard Development']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Smart Cities', 'Waste Management', 'IoT', 'Optimization', 'Sustainability']),
    lookingFor: JSON.stringify(['Hardware engineer', 'Operations researcher']),
  },
  {
    title: 'CityPulse: Urban Air Quality Monitoring and Prediction',
    abstract: 'Dense network of low-cost air quality sensors with ML-based pollution prediction and citizen alert system for urban areas.',
    problemStatement: 'Existing air quality monitoring stations are sparse, leaving most urban areas without reliable air quality data.',
    objectives: JSON.stringify(['Deploy sensor network', 'Real-time pollution mapping', 'ML prediction models', 'Citizen mobile app']),
    domain: 'Smart Cities',
    subdomain: 'Environment Monitoring',
    technologies: JSON.stringify(['Arduino', 'LoRa', 'Python', 'LSTM', 'React Native', 'Firebase']),
    skills: JSON.stringify(['IoT', 'Time Series Analysis', 'Mobile Development', 'Environmental Science']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    tags: JSON.stringify(['Smart Cities', 'Air Quality', 'IoT', 'LSTM', 'Environment']),
    lookingFor: JSON.stringify(['Environmental scientist', 'Mobile developer']),
  },
  // Cybersecurity cluster
  {
    title: 'NetGuard: Intrusion Detection System using Machine Learning',
    abstract: 'ML-based network intrusion detection system that identifies and classifies network attacks in real-time with 98.5% accuracy using ensemble methods.',
    problemStatement: 'Traditional signature-based IDS fail to detect zero-day attacks and novel threat patterns.',
    objectives: JSON.stringify(['Feature engineering on network traffic', 'Train ensemble ML model', 'Real-time packet analysis', 'Alert and logging system']),
    domain: 'Cybersecurity',
    subdomain: 'Network Security',
    technologies: JSON.stringify(['Python', 'Scikit-learn', 'XGBoost', 'Wireshark', 'Elasticsearch', 'Kibana']),
    skills: JSON.stringify(['Machine Learning', 'Network Security', 'Log Analysis', 'Python']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Cybersecurity', 'IDS', 'Machine Learning', 'Network', 'Security']),
    lookingFor: JSON.stringify(['Network engineer', 'Security researcher']),
  },
  {
    title: 'PhishShield: Deep Learning Phishing Detection',
    abstract: 'Browser extension using deep learning to detect phishing websites in real-time with BERT-based URL and content analysis.',
    problemStatement: 'Phishing attacks bypass traditional blacklist-based protection. Users need real-time intelligent protection.',
    objectives: JSON.stringify(['URL feature extraction', 'BERT model fine-tuning', 'Browser extension development', 'Real-time classification']),
    domain: 'Cybersecurity',
    subdomain: 'Phishing Detection',
    technologies: JSON.stringify(['Python', 'BERT', 'JavaScript', 'Chrome Extension API', 'FastAPI']),
    skills: JSON.stringify(['NLP', 'Browser Extension', 'Cybersecurity', 'Deep Learning']),
    status: 'APPROVED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Cybersecurity', 'Phishing', 'BERT', 'NLP', 'Browser Extension']),
    lookingFor: JSON.stringify(['Frontend developer', 'Security analyst']),
  },
  // Education cluster
  {
    title: 'LearnPath: Adaptive Learning Platform with AI Personalization',
    abstract: 'AI-driven e-learning platform that personalizes study paths, difficulty, and content based on student performance and learning style.',
    problemStatement: 'One-size-fits-all online courses fail to adapt to individual learning speeds and knowledge gaps.',
    objectives: JSON.stringify(['Learning style assessment', 'Adaptive content recommendation', 'Performance analytics', 'Gamification system']),
    domain: 'Education',
    subdomain: 'EdTech',
    technologies: JSON.stringify(['React', 'Node.js', 'Python', 'Collaborative Filtering', 'PostgreSQL', 'Redis']),
    skills: JSON.stringify(['Recommendation Systems', 'Full Stack', 'EdTech', 'Gamification']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Education', 'AI', 'Personalization', 'EdTech', 'Adaptive Learning']),
    lookingFor: JSON.stringify(['Educational psychologist', 'Content creator']),
  },
  {
    title: 'ExamShield: AI Proctoring System for Online Examinations',
    abstract: 'AI-powered online exam proctoring system using facial recognition, gaze tracking, and behavior analysis to ensure examination integrity.',
    problemStatement: 'Online exams lack credible proctoring, making it easy to cheat, undermining the value of online certifications.',
    objectives: JSON.stringify(['Face detection and verification', 'Gaze tracking', 'Audio monitoring', 'Suspicious behavior flagging', 'Examiner dashboard']),
    domain: 'Education',
    subdomain: 'EdTech',
    technologies: JSON.stringify(['Python', 'OpenCV', 'Dlib', 'React', 'WebRTC', 'FastAPI']),
    skills: JSON.stringify(['Computer Vision', 'Face Recognition', 'WebRTC', 'Full Stack']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    tags: JSON.stringify(['Education', 'Proctoring', 'Computer Vision', 'Face Recognition', 'Online Exam']),
    lookingFor: JSON.stringify(['Privacy/legal expert', 'Backend engineer']),
  },
  // FinTech cluster
  {
    title: 'FraudNet: Real-time Credit Card Fraud Detection',
    abstract: 'Graph neural network-based fraud detection system for real-time credit card transaction monitoring with sub-millisecond response time.',
    problemStatement: 'Credit card fraud causes billions in annual losses. Traditional rule-based systems have high false-positive rates.',
    objectives: JSON.stringify(['Transaction graph modeling', 'GNN-based fraud classification', 'Real-time streaming pipeline', 'Explainable AI for fraud reasons']),
    domain: 'FinTech',
    subdomain: 'Fraud Detection',
    technologies: JSON.stringify(['Python', 'PyTorch Geometric', 'Apache Kafka', 'Redis', 'FastAPI', 'React']),
    skills: JSON.stringify(['Graph Neural Networks', 'Stream Processing', 'FinTech', 'Explainable AI']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['FinTech', 'Fraud Detection', 'Graph Neural Network', 'Kafka', 'Real-time']),
    lookingFor: JSON.stringify(['FinTech domain expert', 'Data engineer']),
  },
  {
    title: 'MicroLend: Peer-to-Peer Micro-Lending Platform with Credit Scoring',
    abstract: 'Blockchain-enabled P2P micro-lending platform with ML-based alternative credit scoring for unbanked populations using mobile usage patterns.',
    problemStatement: 'Traditional credit scoring excludes millions of creditworthy individuals who lack formal credit history.',
    objectives: JSON.stringify(['Alternative credit scoring model', 'Smart contract lending', 'Borrower risk assessment', 'Investor dashboard']),
    domain: 'FinTech',
    subdomain: 'Micro-Finance',
    technologies: JSON.stringify(['Solidity', 'Ethereum', 'Python', 'XGBoost', 'React', 'Web3.js']),
    skills: JSON.stringify(['Blockchain', 'Smart Contracts', 'Credit Scoring', 'Web3']),
    status: 'APPROVED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['FinTech', 'Blockchain', 'Micro-Finance', 'Credit Scoring', 'Web3']),
    lookingFor: JSON.stringify(['Finance expert', 'Blockchain developer']),
  },
  // Robotics
  {
    title: 'PathBot: Autonomous Indoor Navigation Robot',
    abstract: 'ROS-based mobile robot with SLAM navigation for indoor environments, designed to assist in warehouse logistics and hospital material delivery.',
    problemStatement: 'Manual material transport in hospitals and warehouses is labor-intensive and error-prone.',
    objectives: JSON.stringify(['SLAM-based mapping', 'Obstacle avoidance', 'Multi-floor navigation', 'Task scheduling system']),
    domain: 'Robotics',
    subdomain: 'Autonomous Navigation',
    technologies: JSON.stringify(['ROS', 'Python', 'C++', 'LIDAR', 'Raspberry Pi', 'React']),
    skills: JSON.stringify(['ROS', 'SLAM', 'Embedded Systems', 'Robotics']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    tags: JSON.stringify(['Robotics', 'ROS', 'SLAM', 'Autonomous Navigation', 'Warehouse']),
    lookingFor: JSON.stringify(['Mechanical engineer', 'ROS developer']),
  },
  // Sustainability
  {
    title: 'GreenGrid: Solar Energy Prediction and Grid Optimization',
    abstract: 'ML-based solar energy production forecasting system that optimizes grid load distribution and reduces energy wastage in renewable energy grids.',
    problemStatement: 'Intermittent solar energy production creates grid instability and requires expensive battery storage.',
    objectives: JSON.stringify(['Solar irradiance prediction', 'Energy production forecasting', 'Grid optimization algorithm', 'Real-time monitoring dashboard']),
    domain: 'Sustainability',
    subdomain: 'Renewable Energy',
    technologies: JSON.stringify(['Python', 'LSTM', 'Prophet', 'React', 'Node.js', 'InfluxDB']),
    skills: JSON.stringify(['Time Series', 'Energy Systems', 'Grid Computing', 'ML']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Sustainability', 'Solar Energy', 'LSTM', 'Grid Optimization', 'Renewable']),
    lookingFor: JSON.stringify(['Electrical engineer', 'Energy researcher']),
  },
  // Additional AI projects for richer search
  {
    title: 'SentiWatch: Real-time Social Media Sentiment Analysis Dashboard',
    abstract: 'Real-time sentiment analysis platform for social media streams using BERT transformers, providing brand monitoring and crisis detection capabilities.',
    problemStatement: 'Brands and organizations cannot efficiently monitor and respond to public sentiment across social media platforms.',
    objectives: JSON.stringify(['Real-time tweet stream processing', 'BERT-based sentiment classification', 'Trend detection', 'Alert system for negative spikes']),
    domain: 'Artificial Intelligence',
    subdomain: 'NLP',
    technologies: JSON.stringify(['Python', 'BERT', 'Twitter API', 'Apache Kafka', 'React', 'D3.js']),
    skills: JSON.stringify(['NLP', 'Sentiment Analysis', 'Stream Processing', 'Data Visualization']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['NLP', 'Sentiment Analysis', 'Social Media', 'Real-time', 'BERT']),
    lookingFor: JSON.stringify(['Data scientist', 'Frontend developer']),
  },
  {
    title: 'VoiceAssist: Multilingual Voice Assistant for Accessibility',
    abstract: 'Offline-capable multilingual voice assistant designed for users with motor disabilities, supporting Indian regional languages with wake-word detection.',
    problemStatement: 'Existing voice assistants require internet connectivity and support limited languages, excluding users with disabilities in rural India.',
    objectives: JSON.stringify(['Offline speech recognition', 'Support for 10+ Indian languages', 'Low-latency response', 'Accessibility features']),
    domain: 'Artificial Intelligence',
    subdomain: 'Speech Processing',
    technologies: JSON.stringify(['Python', 'Whisper', 'Mozilla DeepSpeech', 'React Native', 'FastAPI']),
    skills: JSON.stringify(['Speech Recognition', 'Multilingual NLP', 'Mobile Development', 'Accessibility']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['AI', 'Voice', 'Accessibility', 'Multilingual', 'Speech Recognition']),
    lookingFor: JSON.stringify(['Linguist', 'Accessibility expert']),
  },
  {
    title: 'DocuSmart: Intelligent Document Processing with OCR and NLP',
    abstract: 'AI-powered document processing pipeline that extracts structured information from scanned documents, forms, and PDFs using OCR and NLP.',
    problemStatement: 'Organizations process thousands of paper documents manually. Digitization is expensive and error-prone.',
    objectives: JSON.stringify(['High-accuracy OCR pipeline', 'Named entity extraction', 'Template-based form parsing', 'Search and retrieval system']),
    domain: 'Artificial Intelligence',
    subdomain: 'Document AI',
    technologies: JSON.stringify(['Python', 'Tesseract', 'LayoutLM', 'Elasticsearch', 'FastAPI', 'React']),
    skills: JSON.stringify(['OCR', 'NLP', 'Information Extraction', 'Search Systems']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2023-24',
    tags: JSON.stringify(['AI', 'OCR', 'NLP', 'Document Processing', 'Information Extraction']),
    lookingFor: JSON.stringify(['Backend engineer', 'ML engineer']),
  },
  {
    title: 'SkillBridge: AI-Powered Job-Skill Gap Analyzer',
    abstract: 'Platform that analyzes job postings and student profiles using NLP to identify skill gaps and recommend personalized learning paths.',
    problemStatement: 'Students graduate without clear understanding of industry skill requirements, leading to high unemployment rates.',
    objectives: JSON.stringify(['Job posting NLP analysis', 'Student profile assessment', 'Skill gap identification', 'Learning path recommendation']),
    domain: 'Education',
    subdomain: 'Career Tech',
    technologies: JSON.stringify(['Python', 'spaCy', 'React', 'Node.js', 'PostgreSQL', 'Collaborative Filtering']),
    skills: JSON.stringify(['NLP', 'Recommendation Systems', 'Full Stack', 'Career Tech']),
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    academicYear: '2024-25',
    tags: JSON.stringify(['Education', 'NLP', 'Job Market', 'Skill Gap', 'Recommendation']),
    lookingFor: JSON.stringify(['HR expert', 'Data scientist']),
  },
]

async function main() {
  console.log('🌱 Seeding ProjectSphere database...')

  // Hash a default password
  const password = await bcrypt.hash('Password123!', 10)

  // Create institutions
  console.log('Creating institutions...')
  const createdInstitutions = await Promise.all(
    institutions.map(inst => prisma.institution.create({ data: inst }))
  )

  // Platform Admin
  const platformAdmin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@projectsphere.dev',
      password,
      role: 'PLATFORM_ADMIN',
      bio: 'Platform administrator',
      skills: JSON.stringify(['Platform Management', 'Analytics']),
      domains: JSON.stringify(['Administration']),
    },
  })

  // Create institution admins, faculty, and students for each institution
  const institutionAdmins: any[] = []
  const facultyMembers: any[] = []
  const students: any[] = []

  const studentNames = [
    'Aryan Mehta', 'Priya Sharma', 'Rohan Gupta', 'Ananya Singh', 'Karan Patel',
    'Sneha Reddy', 'Vikram Nair', 'Pooja Iyer', 'Amit Kumar', 'Deepa Menon',
    'Rahul Joshi', 'Nisha Agarwal', 'Siddharth Rao', 'Kavya Pillai', 'Aditya Verma',
    'Shreya Bose', 'Manish Tiwari', 'Riya Kapoor', 'Akash Mishra', 'Tanvi Desai',
  ]

  const domainOptions = [
    'Artificial Intelligence', 'Healthcare', 'Agriculture', 'Smart Cities',
    'Cybersecurity', 'Education', 'FinTech', 'Robotics', 'Sustainability', 'IoT',
  ]

  const skillOptions = [
    'Python', 'Machine Learning', 'Deep Learning', 'React', 'Node.js', 'IoT',
    'Computer Vision', 'NLP', 'Data Analysis', 'Blockchain', 'Robotics', 'Cybersecurity',
  ]

  for (let i = 0; i < createdInstitutions.length; i++) {
    const inst = createdInstitutions[i]

    // Institution admin
    const admin = await prisma.user.create({
      data: {
        name: `Admin ${inst.shortName}`,
        email: `admin@${inst.shortName.toLowerCase()}.edu`,
        password,
        role: 'INSTITUTION_ADMIN',
        institutionId: inst.id,
        bio: `Administrator at ${inst.name}`,
        skills: JSON.stringify(['Administration', 'Analytics']),
        domains: JSON.stringify(['Administration']),
      },
    })
    institutionAdmins.push(admin)

    // 2 faculty per institution
    for (let f = 0; f < 2; f++) {
      const faculty = await prisma.user.create({
        data: {
          name: `Dr. ${studentNames[(i * 2 + f) % studentNames.length].split(' ')[1] || 'Faculty'} ${inst.shortName}`,
          email: `faculty${f + 1}@${inst.shortName.toLowerCase()}.edu`,
          password,
          role: 'FACULTY',
          institutionId: inst.id,
          bio: `Faculty member specializing in ${domainOptions[i % domainOptions.length]}`,
          skills: JSON.stringify([skillOptions[i % skillOptions.length], skillOptions[(i + 1) % skillOptions.length]]),
          domains: JSON.stringify([domainOptions[i % domainOptions.length]]),
        },
      })
      facultyMembers.push(faculty)
    }

    // 5 students per institution
    for (let s = 0; s < 5; s++) {
      const nameIndex = (i * 5 + s) % studentNames.length
      const student = await prisma.user.create({
        data: {
          name: studentNames[nameIndex],
          email: `student${i * 5 + s + 1}@${inst.shortName.toLowerCase()}.edu`,
          password,
          role: 'STUDENT',
          institutionId: inst.id,
          course: 'B.Tech Computer Science',
          year: (s % 4) + 1,
          bio: `Final year student at ${inst.name}`,
          skills: JSON.stringify([skillOptions[s % skillOptions.length], skillOptions[(s + 2) % skillOptions.length], skillOptions[(s + 4) % skillOptions.length]]),
          domains: JSON.stringify([domainOptions[s % domainOptions.length], domainOptions[(s + 2) % domainOptions.length]]),
        },
      })
      students.push(student)
    }
  }

  // Demo student with easy login
  const demoStudent = await prisma.user.create({
    data: {
      name: 'Aisha Khan',
      email: 'student@demo.com',
      password,
      role: 'STUDENT',
      institutionId: createdInstitutions[0].id,
      course: 'B.Tech Computer Science',
      year: 3,
      bio: 'Final year CS student passionate about AI and healthcare applications.',
      skills: JSON.stringify(['Python', 'Machine Learning', 'React', 'Computer Vision', 'NLP']),
      domains: JSON.stringify(['Artificial Intelligence', 'Healthcare', 'Agriculture']),
    },
  })

  const demoFaculty = await prisma.user.create({
    data: {
      name: 'Prof. Rajesh Kumar',
      email: 'faculty@demo.com',
      password,
      role: 'FACULTY',
      institutionId: createdInstitutions[0].id,
      bio: 'Professor of Computer Science with research focus on AI and ML.',
      skills: JSON.stringify(['Research', 'AI', 'Machine Learning', 'Mentorship']),
      domains: JSON.stringify(['Artificial Intelligence', 'Healthcare']),
    },
  })

  console.log('Creating projects...')

  // Create projects, distributed across institutions and students
  const createdProjects = []
  for (let i = 0; i < projectData.length; i++) {
    const proj = projectData[i]
    const owner = i === 0 ? demoStudent : students[i % students.length]
    const institution = createdInstitutions[i % createdInstitutions.length]
    const faculty = facultyMembers[i % facultyMembers.length]

    const slug = proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + i

    const created = await prisma.project.create({
      data: {
        ...proj,
        slug,
        ownerId: owner.id,
        institutionId: institution.id,
        viewCount: Math.floor(Math.random() * 500) + 50,
        saveCount: Math.floor(Math.random() * 100) + 5,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      },
    })
    createdProjects.push(created)

    // Add faculty review for published projects
    if (proj.status === 'PUBLISHED' || proj.status === 'APPROVED') {
      await prisma.facultyReview.create({
        data: {
          projectId: created.id,
          facultyId: faculty.id,
          status: proj.status === 'PUBLISHED' ? 'APPROVED' : 'APPROVED',
          feedback: 'Well-structured project with clear objectives and methodology.',
        },
      })
    }
  }

  // Create similarity relationships (meaningful clusters)
  console.log('Creating similarity data...')

  // Agriculture cluster: projects 0, 1, 2 are all similar
  const agriProjects = createdProjects.slice(0, 3)
  const similarities = [
    { a: 0, b: 1, score: 0.71, problem: 0.65, tech: 0.55, method: 0.70, desc: 0.75, explanation: 'Both projects focus on AI-powered crop monitoring using machine learning and sensor data. They share similar objectives around improving agricultural outcomes through technology.', common: JSON.stringify(['Computer Vision', 'Agriculture domain', 'ML-based analysis', 'IoT sensors']), diff: JSON.stringify(['Project A uses CNN for disease detection from images; Project B uses IoT sensors for continuous monitoring', 'Different datasets and deployment approaches']) },
    { a: 0, b: 2, score: 0.68, problem: 0.80, tech: 0.60, method: 0.65, desc: 0.70, explanation: 'Both projects apply computer vision to agricultural problem solving. FarmAI extends CropGuard with drone deployment.', common: JSON.stringify(['Computer Vision', 'Agriculture', 'Deep Learning', 'Disease/pest detection']), diff: JSON.stringify(['CropGuard uses ground-level leaf images; FarmAI uses drone aerial imagery', 'Different scales of deployment']) },
    { a: 1, b: 2, score: 0.58, problem: 0.55, tech: 0.50, method: 0.60, desc: 0.55, explanation: 'Both target agricultural monitoring but use different sensor modalities — ground IoT vs aerial drones.', common: JSON.stringify(['Agriculture domain', 'Real-time monitoring', 'Field-scale deployment']), diff: JSON.stringify(['IoT sensors vs drone imagery', 'Different technology stacks']) },
  ]

  for (const sim of similarities) {
    await prisma.projectSimilarity.create({
      data: {
        projectAId: createdProjects[sim.a].id,
        projectBId: createdProjects[sim.b].id,
        overallScore: sim.score,
        problemScore: sim.problem,
        techScore: sim.tech,
        methodScore: sim.method,
        descScore: sim.desc,
        explanation: sim.explanation,
        commonAreas: sim.common,
        differences: sim.diff,
      },
    })
  }

  // Healthcare cluster similarities
  await prisma.projectSimilarity.create({
    data: {
      projectAId: createdProjects[3].id,
      projectBId: createdProjects[4].id,
      overallScore: 0.45,
      problemScore: 0.60,
      techScore: 0.35,
      methodScore: 0.40,
      descScore: 0.45,
      explanation: 'Both address healthcare accessibility but from different angles — MediScan focuses on diagnostic AI while HealthBridge provides telemedicine connectivity.',
      commonAreas: JSON.stringify(['Healthcare domain', 'Patient accessibility', 'AI assistance']),
      differences: JSON.stringify(['MediScan: Medical imaging AI; HealthBridge: Video consultation platform', 'Very different tech stacks']),
    },
  })

  // Smart cities similarities
  await prisma.projectSimilarity.create({
    data: {
      projectAId: createdProjects[6].id,
      projectBId: createdProjects[7].id,
      overallScore: 0.52,
      problemScore: 0.65,
      techScore: 0.55,
      methodScore: 0.50,
      descScore: 0.48,
      explanation: 'Both projects apply IoT and optimization algorithms to urban infrastructure problems. TrafficFlow and SmartWaste share route/flow optimization as a common theme.',
      commonAreas: JSON.stringify(['Smart Cities', 'IoT sensors', 'Optimization', 'Urban infrastructure']),
      differences: JSON.stringify(['TrafficFlow: Signal control via RL; SmartWaste: Route optimization via TSP', 'Different optimization domains']),
    },
  })

  // Create innovation insights for key projects
  console.log('Creating innovation insights...')
  await prisma.innovationInsight.create({
    data: {
      projectId: createdProjects[0].id,
      repeatedApproaches: JSON.stringify([
        'Cloud-based inference requiring internet connectivity',
        'Standard CNN architectures (ResNet, VGG) without optimization',
        'English-only user interfaces',
        'Single-disease classification focus',
      ]),
      underexploredAreas: JSON.stringify([
        'Edge/offline inference for low-connectivity rural areas',
        'Multi-modal inputs (images + soil data + weather)',
        'Regional language support for farmer interfaces',
        'Continuous learning from new disease patterns',
      ]),
      researchGaps: JSON.stringify([
        'Very few projects address offline edge inference for agricultural AI',
        'Limited work on multilingual farmer interfaces in Indian regional languages',
        'No projects combine drone imagery with ground-level leaf scan data',
        'Minimal work on model adaptation to new geographic regions',
      ]),
      improvements: JSON.stringify([
        'Implement TinyML/Edge AI for offline inference on mobile devices',
        'Add IoT soil sensor integration for multi-modal prediction',
        'Build multilingual voice interface for farmers (Hindi, Tamil, Telugu)',
        'Create federated learning system for privacy-preserving model updates',
        'Develop crop calendar integration with disease prediction',
      ]),
      emergingTechs: JSON.stringify([
        'TinyML / Edge Inference',
        'Federated Learning',
        'Multimodal Transformers',
        'LoRA for model compression',
      ]),
    },
  })

  await prisma.innovationInsight.create({
    data: {
      projectId: createdProjects[7].id, // SmartWaste
      repeatedApproaches: JSON.stringify([
        'Simple fill-level sensors only',
        'Static route optimization at scheduled times',
        'Single-city deployment without scalability considerations',
      ]),
      underexploredAreas: JSON.stringify([
        'Real-time dynamic re-routing based on traffic conditions',
        'Predictive analytics for fill-level forecasting',
        'Gamification for citizen participation in waste sorting',
        'Integration with smart city data lakes',
      ]),
      researchGaps: JSON.stringify([
        'No projects combine waste management with citizen engagement apps',
        'Lack of integration with weather data for fill-rate prediction',
        'Few projects address composting and waste categorization',
      ]),
      improvements: JSON.stringify([
        'Add citizen-facing app for bin reporting and nearest bin navigation',
        'Integrate weather forecast data for predictive fill-rate modeling',
        'Add computer vision for automatic waste categorization at bins',
        'Create carbon footprint reduction metrics for sustainability reporting',
      ]),
      emergingTechs: JSON.stringify([
        'Computer Vision for waste sorting',
        'Digital Twin for city simulation',
        'Predictive Analytics',
      ]),
    },
  })

  // Create saved projects for demo student
  await prisma.savedProject.create({
    data: {
      userId: demoStudent.id,
      projectId: createdProjects[3].id, // MediScan
      collection: 'Healthcare Ideas',
    },
  })
  await prisma.savedProject.create({
    data: {
      userId: demoStudent.id,
      projectId: createdProjects[1].id, // AgriSense
      collection: 'Agriculture Research',
    },
  })

  // Create recommendations for demo student
  for (let i = 0; i < 5; i++) {
    const proj = createdProjects[(i + 3) % createdProjects.length]
    await prisma.recommendation.upsert({
      where: { userId_projectId: { userId: demoStudent.id, projectId: proj.id } },
      create: {
        userId: demoStudent.id,
        projectId: proj.id,
        score: Math.round((0.9 - i * 0.1) * 100) / 100,
        reason: 'Matches your interest in Artificial Intelligence and Computer Vision',
        category: 'domain_match',
      },
      update: {},
    })
  }

  // Create a collaboration request
  const collabRequest = await prisma.collaborationRequest.create({
    data: {
      fromUserId: demoStudent.id,
      toUserId: students[5].id,
      projectId: createdProjects[0].id,
      message: 'Hi! I saw your IoT expertise and think it would complement my crop disease detection project. Would you be interested in collaborating to add edge deployment capabilities?',
      skillsOffered: JSON.stringify(['Computer Vision', 'Deep Learning', 'Python']),
      skillsNeeded: JSON.stringify(['IoT', 'Edge Computing', 'Raspberry Pi']),
      status: 'PENDING',
    },
  })

  // Create notifications for demo student
  await prisma.notification.create({
    data: {
      userId: demoStudent.id,
      type: 'SIMILAR_PROJECT_DETECTED',
      title: 'Similar project found!',
      message: 'AgriSense shows 71% similarity with your CropGuard project. Review the similarity report.',
      projectId: createdProjects[1].id,
      link: `/projects/${createdProjects[1].id}`,
    },
  })

  await prisma.notification.create({
    data: {
      userId: demoStudent.id,
      type: 'RECOMMENDED_PROJECT',
      title: 'New recommendation for you',
      message: 'FraudNet matches your interests in AI and financial applications.',
      projectId: createdProjects[13].id,
      link: `/projects/${createdProjects[13].id}`,
    },
  })

  await prisma.notification.create({
    data: {
      userId: demoStudent.id,
      type: 'PROJECT_APPROVED',
      title: 'Your project was approved!',
      message: 'CropGuard has been reviewed and approved by Prof. Rajesh Kumar.',
      projectId: createdProjects[0].id,
      link: `/projects/${createdProjects[0].id}`,
    },
  })

  // Create a pending project for faculty review
  const pendingProject = await prisma.project.create({
    data: {
      title: 'EdgeCrop: Offline Plant Disease Detection on Raspberry Pi',
      slug: 'edgecrop-offline-plant-disease-detection-rpi',
      abstract: 'A lightweight TinyML model for plant disease detection that runs entirely offline on Raspberry Pi, enabling usage in areas without internet connectivity.',
      problemStatement: 'Existing plant disease detection systems require cloud connectivity, making them unusable in remote rural areas with poor internet.',
      objectives: JSON.stringify(['Compress CNN model to < 5MB', 'Run inference on Raspberry Pi 4', 'Achieve 85%+ accuracy offline', 'Build solar-powered enclosure']),
      domain: 'Artificial Intelligence',
      subdomain: 'Edge AI',
      technologies: JSON.stringify(['Python', 'TensorFlow Lite', 'Raspberry Pi', 'OpenCV', 'Flutter']),
      skills: JSON.stringify(['TinyML', 'Edge Computing', 'Model Compression', 'IoT']),
      methodology: 'Model quantization and pruning of MobileNetV3 to fit on resource-constrained devices.',
      status: 'UNDER_REVIEW',
      visibility: 'PUBLIC',
      academicYear: '2024-25',
      ownerId: demoStudent.id,
      institutionId: createdInstitutions[0].id,
      lookingFor: JSON.stringify(['Hardware engineer', 'IoT specialist']),
      tags: JSON.stringify(['AI', 'Edge Computing', 'Agriculture', 'TinyML', 'Offline']),
    },
  })

  // Notification for faculty about pending review
  await prisma.notification.create({
    data: {
      userId: demoFaculty.id,
      type: 'FACULTY_REVIEW',
      title: 'Project pending your review',
      message: 'EdgeCrop by Aisha Khan requires your review and approval.',
      projectId: pendingProject.id,
      link: `/faculty/reviews`,
    },
  })

  console.log('✅ Seeding complete!')
  console.log('\n📋 Demo Accounts:')
  console.log('  Student:  student@demo.com / Password123!')
  console.log('  Faculty:  faculty@demo.com / Password123!')
  console.log('  Admin:    admin@projectsphere.dev / Password123!')
  console.log(`\n📊 Created: ${createdInstitutions.length} institutions, ${students.length + 3} users, ${createdProjects.length + 1} projects`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
