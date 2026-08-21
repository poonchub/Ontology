export type GraphNode = { id: string; label: string; type: 'person' | 'course' | 'department' | 'program'; meta: string }
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; time: string; structured?: { course: string; code: string; department: string; credits: string }; evidence?: string[]; sparql?: string }
export const conversations = [
  { title: 'Database Course Prerequisites', time: '2m ago', active: true },
  { title: 'Who teaches AI?', time: 'Yesterday' },
  { title: 'Computer Science Courses', time: 'Yesterday' },
  { title: 'Professor Information', time: 'Mon' },
  { title: 'Course Enrollment', time: 'Sun' },
]
export const graphNodes: GraphNode[] = [
  { id: 'somchai', label: 'Somchai', type: 'person', meta: 'Professor' },
  { id: 'cs201', label: 'Database Systems', type: 'course', meta: 'CS201 · 3 credits' },
  { id: 'cs101', label: 'Programming', type: 'course', meta: 'CS101' },
  { id: 'cs301', label: 'Advanced Database', type: 'course', meta: 'CS301' },
  { id: 'cs', label: 'Computer Science', type: 'department', meta: 'Department' },
]
export const defaultMessages: ChatMessage[] = [
  { id: 'u1', role: 'user', content: 'What are the prerequisites for Advanced Database?', time: '10:42 AM' },
  { id: 'a1', role: 'assistant', content: 'To enroll in Advanced Database (CS301), students must first complete Database Systems (CS201).', time: '10:42 AM', evidence: ['3 relationships found', 'CS301 prerequisite CS201', 'CS201 prerequisite CS101'], sparql: 'SELECT ?prerequisite\nWHERE {\n  :AdvancedDatabase :prerequisite ?prerequisite .\n}', },
]
export const suggestedQuestions = ['Who teaches Database Systems?', 'Which courses are offered by Computer Science?', 'What does Professor Somchai teach?']
export async function mockChat(message: string): Promise<ChatMessage> {
  const normalized = message.toLowerCase()
  const content = normalized.includes('teach') ? 'Professor Somchai teaches Database Systems (CS201).' : normalized.includes('course') ? 'The Computer Science department offers Programming Fundamentals, Database Systems, Advanced Database, and Artificial Intelligence.' : 'Advanced Database (CS301) requires Database Systems (CS201), which in turn requires Programming Fundamentals (CS101).'
  return { id: `a-${Date.now()}`, role: 'assistant', content, time: 'Now', structured: content.includes('Database Systems') ? { course: 'Database Systems', code: 'CS201', department: 'Computer Science', credits: '3' } : undefined, evidence: ['Knowledge Graph matched 3 entities', 'University Course Knowledge domain'], sparql: 'SELECT ?course\nWHERE {\n  ?course :belongsTo :ComputerScience .\n}' }
}
