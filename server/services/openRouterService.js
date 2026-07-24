const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

/**
 * Parse AI JSON response using 3-strategy approach:
 * 1. Direct JSON.parse
 * 2. Extract from markdown code block
 * 3. Extract first {...} or [...] block
 */
function parseAIJson(text) {
  if (!text) return null;

  // Strategy 1: Direct parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // Strategy 2: Extract from markdown code block ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (_) {}
  }

  // Strategy 3: Extract first {...} or [...] block
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (_) {}
  }

  return null;
}

async function queryAI(prompt, context = '', options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options.model || process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');

  if (!apiKey || !model || !baseUrl || apiKey === 'your_openrouter_key_here') throw new Error('OpenRouter runtime configuration is required');

  const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Quantum Computing Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are an expert quantum computing assistant. Provide detailed, accurate, and professional analysis. Format your responses with clear sections, bullet points, and technical details where appropriate. Always be specific and actionable in your recommendations.'
          },
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nQuery: ${prompt}` : prompt
          }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })
    });

  if (!response.ok) throw new Error(`OpenRouter request failed with HTTP ${response.status}`);
  const data = await response.json();

  if (data.error) throw new Error(data.error.message || 'AI service error');

  const rawContent = String(data.choices?.[0]?.message?.content || '').trim();
  if (!rawContent) throw new Error('OpenRouter returned empty content');

  return { success: true, response: rawContent, model: data.model || model, usage: data.usage || null, id: data.id };
}

/**
 * Query AI and request structured JSON output.
 * Returns { success, parsed, raw, model, usage }
 */
async function queryAIStructured(prompt, context = '', options = {}) {
  const jsonSystemPrompt = `${options.systemPrompt || 'You are an expert quantum computing assistant.'}\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanation outside the JSON object.`;

  const result = await queryAI(prompt, context, { ...options, systemPrompt: jsonSystemPrompt });

  if (!result.success) {
    return { ...result, parsed: null };
  }

  const parsed = parseAIJson(result.response);
  return { ...result, parsed };
}

module.exports = { queryAI, queryAIStructured, parseAIJson };
