import { askGroq } from './groqService.js';

export async function askAI(prompt) {
    return await askGroq(prompt);
}