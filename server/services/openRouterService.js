const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function queryAI(prompt, context = '') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_key_here') {
    return {
      success: false,
      response: 'OpenRouter API key not configured. Please add your key to .env file.',
      model: model,
      usage: null
    };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Quantum Computing Assistant'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert quantum computing assistant. Provide detailed, accurate, and professional analysis. Format your responses with clear sections, bullet points, and technical details where appropriate. Always be specific and actionable in your recommendations.'
          },
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nQuery: ${prompt}` : prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        response: data.error.message || 'AI service error',
        model: model,
        usage: null
      };
    }

    return {
      success: true,
      response: data.choices?.[0]?.message?.content || 'No response generated',
      model: data.model || model,
      usage: data.usage || null,
      id: data.id
    };
  } catch (error) {
    return {
      success: false,
      response: `AI service connection error: ${error.message}`,
      model: model,
      usage: null
    };
  }
}

module.exports = { queryAI };
