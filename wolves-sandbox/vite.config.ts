import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'LLM_');
  return { server: { port: 5173 }, plugins: [{ name: 'llm-local-proxy', configureServer(server) {
    server.middlewares.use('/api/llm-config', (_req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ enabled: Boolean(env.LLM_BASE_URL && env.LLM_MODEL && env.LLM_PROVIDER !== 'mock'), maxCallsPerMinute: Number(env.LLM_MAX_CALLS_PER_MINUTE) || 6, timeoutMs: Number(env.LLM_TIMEOUT_MS) || 5000 })); });
    server.middlewares.use('/api/llm', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return; }
      if (!env.LLM_BASE_URL || !env.LLM_MODEL || env.LLM_PROVIDER === 'mock') { res.statusCode = 503; res.end('LLM provider not configured'); return; }
      try {
        let body = ''; for await (const chunk of req) body += chunk;
        if (body.length > 16000) { res.statusCode = 413; res.end('Observation too large'); return; }
        const parsed = JSON.parse(body) as { observation: { mode?: string; chosenAction?: string } };
        const ollama = env.LLM_PROVIDER === 'ollama';
        const url = `${env.LLM_BASE_URL.replace(/\/$/, '')}${ollama ? '/api/chat' : '/chat/completions'}`;
        const actions = 'IDLE,WANDER,GO_TO,DRINK,EAT,HUNT,REST,FLEE,FOLLOW,PLAY,SHARE_FOOD,GROOM,HOWL,QUARREL,CHALLENGE,SUBMIT';
        const chosen = actions.split(',').includes(parsed.observation?.chosenAction ?? '') ? parsed.observation.chosenAction : 'IDLE';
        const system = parsed.observation?.mode === 'hybrid' ? `Viết suy nghĩ tiếng Việt ngắn cho hành động cố định ${chosen}. Mỗi sói muốn thống trị hai sói còn lại, nhưng vẫn phải sống sót. Trả JSON {action:"${chosen}",thought,appraisal:{}}. Không đổi hành động.` : `Mỗi sói muốn thống trị hai sói còn lại để trở thành bá chủ. Ưu tiên sinh tồn. Trả JSON {action,targetId,thought,appraisal}, thought tiếng Việt. Hành động hợp lệ: ${actions}.`;
        const upstream = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(Number(env.LLM_TIMEOUT_MS) || 5000), headers: { 'Content-Type': 'application/json', ...(env.LLM_API_KEY ? { Authorization: `Bearer ${env.LLM_API_KEY}` } : {}) }, body: JSON.stringify({ model: env.LLM_MODEL, stream: false, ...(ollama ? { format: 'json' } : {}), messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(parsed.observation) }] }) });
        const data = await upstream.json() as { message?: { content?: string }; choices?: { message?: { content?: string } }[] };
        if (!upstream.ok) throw new Error(`Provider HTTP ${upstream.status}`);
        res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ reply: data.message?.content ?? data.choices?.[0]?.message?.content }));
      } catch (error) { res.statusCode = 502; res.end(error instanceof Error ? error.message : 'Provider error'); }
    });
  } }] };
});
