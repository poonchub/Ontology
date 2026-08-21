export type GraphNode = { id: string; label: string; type: 'person' | 'course' | 'department' | 'program'; meta: string }
export type ChatResult = Record<string, string | number | boolean | null>
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; time: string; structured?: { course: string; code: string; department: string; credits: string }; evidence?: string[]; results?: ChatResult[]; sparql?: string }
export type ConversationSummary = { id: number; title: string; created_at: string; updated_at: string; message_count: number }
export const conversations: { title: string; time: string; active?: boolean }[] = []
export const graphNodes: GraphNode[] = []
export const defaultMessages: ChatMessage[] = []
export const suggestedQuestions = ['Which fruits are yellow?', 'What is the sweetness of Banana?', 'Which fruits are grown in Thailand?']
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch(`${backendUrl}/api/chats`)
  if (!response.ok) throw new Error('Unable to load conversations')
  return response.json()
}

export async function fetchConversationMessages(conversationId: number): Promise<ChatMessage[]> {
  const response = await fetch(`${backendUrl}/api/chats/${conversationId}`)
  if (!response.ok) throw new Error('Unable to load conversation')
  const messages = await response.json()
  return messages.flatMap((item: { id: number; question: string; answer: string; generated_sparql: string; results: ChatResult[]; created_at: string }) => [
    { id: `u-${item.id}`, role: 'user' as const, content: item.question, time: formatTime(item.created_at) },
    { id: `a-${item.id}`, role: 'assistant' as const, content: item.answer, time: formatTime(item.created_at), evidence: [`${item.results.length} result${item.results.length === 1 ? '' : 's'} found`, 'Knowledge Graph verified result'], results: item.results, sparql: item.generated_sparql },
  ])
}

export async function chatWithBackend(message: string, conversationId?: number): Promise<{ message: ChatMessage; conversationId: number }> {
  try {
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, ...(conversationId ? { conversation_id: conversationId } : {}) }),
    })
    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.detail ?? 'Unable to contact the knowledge graph')
    }
    return { conversationId: payload.conversation_id, message: {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: payload.answer,
      time: 'Now',
      evidence: [`${payload.results.length} result${payload.results.length === 1 ? '' : 's'} found`, 'Knowledge Graph verified result'],
      results: payload.results,
      sparql: payload.generated_sparql,
    } }
  } catch (error) {
    return { conversationId: conversationId ?? 0, message: {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: error instanceof Error ? error.message : 'Unable to contact the knowledge graph',
      time: 'Now',
      evidence: ['Request failed'],
    } }
  }
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
