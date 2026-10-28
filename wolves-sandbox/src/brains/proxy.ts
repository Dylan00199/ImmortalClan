import type { LLMAdapter } from './llm';
export class ProxyAdapter implements LLMAdapter {
  async request(observation: unknown): Promise<unknown> {
    const response = await fetch('/api/llm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ observation }) });
    if (!response.ok) throw new Error(`LLM proxy ${response.status}`);
    return (await response.json() as { reply: unknown }).reply;
  }
}
