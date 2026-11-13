import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function askGroq(prompt) {
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.3,
        max_completion_tokens: 700
    });

    return response.choices[0].message.content;
}