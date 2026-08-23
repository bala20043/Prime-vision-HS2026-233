export const suggestions = [
  {
    id: 1,
    text: 'What is the minimum attendance requirement?',
    category: 'Attendance',
  },
  {
    id: 2,
    text: 'What are the college working hours?',
    category: 'College Timings',
  },
  {
    id: 3,
    text: 'How many books can I borrow from the library?',
    category: 'Library',
  },
  {
    id: 4,
    text: 'Are mobile phones allowed in the examination hall?',
    category: 'Examination',
  },
  {
    id: 5,
    text: 'How should planned leave be submitted?',
    category: 'Leave Policy',
  },
  {
    id: 6,
    text: 'What is the library opening time?',
    category: 'Library',
  },
  {
    id: 7,
    text: 'Is club membership compulsory?',
    category: 'Student Clubs',
  },
  {
    id: 8,
    text: 'Who handles technical issues related to the student portal?',
    category: 'Student Support',
  },
  {
    id: 9,
    text: 'How early should I report to the examination hall?',
    category: 'Examination',
  },
  {
    id: 10,
    text: 'What happens if attendance falls below the required percentage?',
    category: 'Attendance',
  },
];

export const welcomeSuggestions = suggestions.slice(0, 5);

export const popularSuggestions = [
  suggestions[5],
  suggestions[2],
  suggestions[8],
  suggestions[6],
  suggestions[7],
];
