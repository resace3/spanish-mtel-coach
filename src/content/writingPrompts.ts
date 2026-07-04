export interface PromptFamily {
  id: string;
  objectiveCode: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  context: string;
  tasks: string[];
  tags: string[];
}

export const writingPromptFamilies: PromptFamily[] = [
  {
    id: 'family-communication',
    objectiveCode: 'W-01',
    difficulty: 2,
    context: 'Write a short message in Spanish to a parent or guardian.',
    tasks: [
      'explain a homework routine and invite one question',
      'summarize a classroom success and suggest one next step',
      'describe a schedule change and give a polite reminder',
      'invite the family to a bilingual reading event',
      'explain what materials a student should bring tomorrow',
    ],
    tags: ['writing', 'family communication', 'register'],
  },
  {
    id: 'classroom-response',
    objectiveCode: 'W-02',
    difficulty: 3,
    context: 'Write an organized paragraph in Spanish for a classroom situation.',
    tasks: [
      'describe how students can prepare for a group presentation',
      'compare two study strategies and recommend one',
      'explain why peer feedback can improve writing',
      'summarize classroom rules for a new student',
      'describe a useful routine for learning vocabulary',
    ],
    tags: ['writing', 'classroom', 'organization'],
  },
  {
    id: 'cultural-comparison',
    objectiveCode: 'W-03',
    difficulty: 4,
    context: 'Write a brief cultural comparison in Spanish.',
    tasks: [
      'compare two ways communities use public spaces',
      'compare family or community storytelling practices without generalizing',
      'compare two educational routines and explain their purposes',
      'compare how local events can preserve community memory',
      'compare formal and informal communication in two contexts',
    ],
    tags: ['writing', 'cultural comparison', 'perspectives'],
  },
  {
    id: 'recommendation',
    objectiveCode: 'W-04',
    difficulty: 3,
    context: 'Write a recommendation in Spanish with reasons.',
    tasks: [
      'recommend an activity for a Spanish club meeting',
      'recommend a reading strategy for a student who feels frustrated',
      'recommend a community resource for a family new to town',
      'recommend a respectful way to discuss language variation',
      'recommend how to prepare for an oral presentation',
    ],
    tags: ['writing', 'recommendation', 'supporting details'],
  },
  {
    id: 'narration',
    objectiveCode: 'W-05',
    difficulty: 3,
    context: 'Write a short narrative in Spanish.',
    tasks: [
      'tell what happened during a successful classroom activity',
      'describe a time someone solved a communication problem',
      'narrate a visit to a museum, library, or community event',
      'describe how a student improved after practicing',
      'tell about an unexpected change in plans and the response',
    ],
    tags: ['writing', 'narration', 'past tenses'],
  },
  {
    id: 'informational',
    objectiveCode: 'W-06',
    difficulty: 4,
    context: 'Write an informational note in Spanish.',
    tasks: [
      'explain the steps for completing a short research task',
      'describe how to use context clues when reading',
      'explain how to prepare for a listening activity',
      'describe what makes a source reliable for a culture lesson',
      'explain how to organize a persuasive paragraph',
    ],
    tags: ['writing', 'informational', 'academic language'],
  },
  {
    id: 'reflection',
    objectiveCode: 'W-07',
    difficulty: 5,
    context: 'Write a reflective response in Spanish.',
    tasks: [
      'reflect on how bilingualism can support learning',
      'reflect on why cultural comparisons should avoid stereotypes',
      'reflect on how feedback can change a spoken presentation',
      'reflect on how local history can appear in art or literature',
      'reflect on why register matters in professional communication',
    ],
    tags: ['writing', 'reflection', 'analysis'],
  },
];
