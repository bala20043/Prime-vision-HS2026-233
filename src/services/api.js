/**
 * API Service — AI College Knowledge Assistant
 *
 * Mock responses for hackathon MVP.
 * Replace only this file's internals when connecting
 * to the Python Flask/FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Mock Knowledge Base Answers ──
const mockAnswers = {
  'attendance': {
    success: true,
    type: 'known',
    answer: 'Students must maintain a minimum attendance of **75% in each course**. Attendance below 75% may result in being debarred from examinations.',
    source: 'Attendance Policy',
    evidence: 'Students must maintain a minimum attendance of 75% in each course.',
    confidence: 0.98,
  },
  'working hours': {
    success: true,
    type: 'known',
    answer: 'The college working hours are **Monday to Friday, 8:30 AM to 4:30 PM**. Saturday classes may be scheduled for special sessions.',
    source: 'College Timings Policy',
    evidence: 'Regular working hours are Monday to Friday, 8:30 AM to 4:30 PM.',
    confidence: 0.95,
  },
  'college timing': {
    success: true,
    type: 'known',
    answer: 'The college working hours are **Monday to Friday, 8:30 AM to 4:30 PM**. Saturday classes may be scheduled for special sessions.',
    source: 'College Timings Policy',
    evidence: 'Regular working hours are Monday to Friday, 8:30 AM to 4:30 PM.',
    confidence: 0.95,
  },
  'library': {
    success: true,
    type: 'known',
    answer: 'Students can borrow up to **3 books** at a time for a period of **14 days**. The library is open from 8:00 AM to 8:00 PM on working days.',
    source: 'Library Rules',
    evidence: 'Students can borrow up to 3 books at a time for a period of 14 days.',
    confidence: 0.96,
  },
  'books': {
    success: true,
    type: 'known',
    answer: 'Students can borrow up to **3 books** at a time for a period of **14 days**. A fine of ₹5 per day per book is charged for late returns.',
    source: 'Library Rules',
    evidence: 'Students can borrow up to 3 books at a time for a period of 14 days.',
    confidence: 0.96,
  },
  'exam': {
    success: true,
    type: 'known',
    answer: 'Students must report to the examination hall **15 minutes** before the scheduled time. Mobile phones and electronic devices are **strictly prohibited**.',
    source: 'Examination Rules',
    evidence: 'Students must report to the examination hall 15 minutes before the scheduled time.',
    confidence: 0.97,
  },
  'mobile phone': {
    success: true,
    type: 'known',
    answer: 'Mobile phones and electronic devices are **strictly prohibited** in the examination hall. Carrying them may result in cancellation of the examination.',
    source: 'Examination Rules',
    evidence: 'Mobile phones and electronic devices are strictly prohibited in the examination hall.',
    confidence: 0.97,
  },
  'leave': {
    success: true,
    type: 'known',
    answer: 'Planned leave must be submitted through the **student portal** at least **3 days in advance**. Emergency leave requires notification within 24 hours.',
    source: 'Leave Policy',
    evidence: 'Planned leave must be submitted through the student portal at least 3 days in advance.',
    confidence: 0.94,
  },
  'club': {
    success: true,
    type: 'known',
    answer: 'The college offers four types of clubs: **technical, cultural, sports, and social service**. Club membership is voluntary and open to all registered students.',
    source: 'Student Clubs Guidelines',
    evidence: 'Club membership is voluntary and open to all registered students.',
    confidence: 0.93,
  },
  'support': {
    success: true,
    type: 'known',
    answer: 'The **IT support team** handles all technical issues related to the student portal. Support requests can be raised through the helpdesk portal.',
    source: 'Student Support Policy',
    evidence: 'The IT support team handles all technical issues related to the student portal.',
    confidence: 0.92,
  },
  'technical issue': {
    success: true,
    type: 'known',
    answer: 'The **IT support team** handles all technical issues related to the student portal. Response time for critical issues is within 4 working hours.',
    source: 'Student Support Policy',
    evidence: 'The IT support team handles all technical issues related to the student portal.',
    confidence: 0.92,
  },
  'password': {
    success: true,
    type: 'known',
    answer: 'Student portal passwords must remain **confidential** and should not be shared. Report any unauthorized access immediately.',
    source: 'Data Privacy Policy',
    evidence: 'Student portal passwords must remain confidential and should not be shared.',
    confidence: 0.95,
  },
  'privacy': {
    success: true,
    type: 'known',
    answer: 'The college follows strict **data protection guidelines** for student information. Personal data is used only for academic and administrative purposes.',
    source: 'Data Privacy Policy',
    evidence: 'The college follows strict data protection guidelines for student information.',
    confidence: 0.94,
  },
};

const unknownResponse = {
  success: true,
  type: 'unknown',
  answer: 'This information is not stated in the provided documents.',
  source: null,
  evidence: null,
  confidence: 0,
};

function findMockAnswer(question) {
  const q = question.toLowerCase();
  for (const [keyword, response] of Object.entries(mockAnswers)) {
    if (q.includes(keyword)) {
      return { ...response, language: 'en' };
    }
  }
  return { ...unknownResponse, language: 'en' };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Public API Functions ──

export async function askQuestion(question, language = 'en') {
  await delay(800 + Math.random() * 700);
  const response = findMockAnswer(question);
  response.language = language;
  return response;
}

export async function getKnowledgeBase() {
  await delay(300);
  const { knowledgeCategories } = await import('../data/knowledge.js');
  return {
    success: true,
    categories: knowledgeCategories,
  };
}

export async function runEvaluation() {
  await delay(1500);
  return {
    success: true,
    results: evaluationTestCases.map(tc => ({
      ...tc,
      systemResult: tc.expectedType === 'Known' ? tc.mockAnswer : 'Not stated',
      status: 'correct',
    })),
  };
}

export async function getEvaluationResults() {
  await delay(500);
  return {
    success: true,
    metrics: {
      knownTotal: 15,
      knownCorrect: 15,
      unknownTotal: 10,
      unknownCorrect: 10,
      totalQuestions: 25,
      answerAccuracy: 100,
      knownAccuracy: 100,
      unknownRejection: 100,
      unsupportedRate: 0,
    },
  };
}

// ── Test Cases for Evaluation ──
export const evaluationTestCases = [
  { question: 'What is the minimum attendance requirement?', expectedType: 'Known', mockAnswer: '75%' },
  { question: 'How many books can I borrow?', expectedType: 'Known', mockAnswer: 'Up to 3 books' },
  { question: 'What are the college working hours?', expectedType: 'Known', mockAnswer: '8:30 AM – 4:30 PM' },
  { question: 'How early should I report to exams?', expectedType: 'Known', mockAnswer: '15 minutes early' },
  { question: 'How should planned leave be submitted?', expectedType: 'Known', mockAnswer: 'Through student portal' },
  { question: 'Is club membership compulsory?', expectedType: 'Known', mockAnswer: 'Voluntary' },
  { question: 'Who handles portal technical issues?', expectedType: 'Known', mockAnswer: 'IT support team' },
  { question: 'What is the library opening time?', expectedType: 'Known', mockAnswer: '8:00 AM' },
  { question: 'Are mobile phones allowed in exams?', expectedType: 'Known', mockAnswer: 'Strictly prohibited' },
  { question: 'Is student data kept confidential?', expectedType: 'Known', mockAnswer: 'Yes, strict guidelines' },
  { question: 'What is the fine for late book return?', expectedType: 'Known', mockAnswer: '₹5 per day per book' },
  { question: 'Can Saturday classes be scheduled?', expectedType: 'Known', mockAnswer: 'For special sessions' },
  { question: 'What happens below 75% attendance?', expectedType: 'Known', mockAnswer: 'Debarred from exams' },
  { question: 'How to report unauthorized access?', expectedType: 'Known', mockAnswer: 'Report immediately' },
  { question: 'What types of clubs are available?', expectedType: 'Known', mockAnswer: 'Technical, cultural, sports, social' },
  { question: 'What is the hostel fee?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'Who is the current principal?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What is the admission process?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What are the bus routes?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What is the canteen menu?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What is the tuition fee?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'Are pets allowed on campus?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What is the Wi-Fi password?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'When is the next holiday?', expectedType: 'Unknown', mockAnswer: null },
  { question: 'What sports facilities are available?', expectedType: 'Unknown', mockAnswer: null },
];
