import express from 'express';
import { getMaterialData } from '../services/materialCache.js';
import { askAI } from '../services/aiService.js';

const router = express.Router();

const MATERIALS = ['lumber', 'steel', 'concrete'];

function summarizePeriod(data, months) {
    const selected = months === null ? data : data.slice(-months);

    const first = selected[0];
    const last = selected[selected.length - 1];

    return {
        startDate: first.date,
        endDate: last.date,
        startIndex: first.value,
        endIndex: last.value,
        changePercent: Number(
            (((last.value - first.value) / first.value) * 100).toFixed(2)
        ),
        latestMoM: last.MoM,
        latestYoY: last.YoY,
        latestVolatility: last.volatility
    };
}

router.post('/', async (req, res) => {
    try {
        const { question, material, dateRange = '12m', history = [] } = req.body;

        // Validate the request.
        if (typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({
                error: 'A question is required.'
            });
        }

        if (question.length > 2000) {
            return res.status(400).json({
                error: 'Question is too long.'
            });
        }

        if (!MATERIALS.includes(material)) {
            return res.status(400).json({
                error: 'Invalid material.'
            });
        }

        // Validate dashboard date range
        const validRanges = ['6m', '12m', '5y', '10y', 'all'];

        if (!validRanges.includes(dateRange)) {
            return res.status(400).json({
                error: 'Invalid date range.'
            });
        }

        if (!Array.isArray(history)) {
            return res.status(400).json({
                error: 'History must be an array.'
            });
        }

        // Gather cached information for all three materials.

        const materialContext = {};

        for (const name of MATERIALS) {
            const cached = getMaterialData(name);
            const data = cached.data;

            materialContext[name] = {
                latest: data[data.length - 1],

                // Period summaries for different questions
                periods: {
                    '6m': summarizePeriod(data, 6),
                    '12m': summarizePeriod(data, 12),
                    '5y': summarizePeriod(data, 60),
                    '10y': summarizePeriod(data, 120),
                    'all': summarizePeriod(data, null)
                },

                // Monthly data for recent analysis
                recentData: data.slice(-12),

                // Seasonal purchasing analysis
                historicalMonthlyTrends: cached.historicalMonthlyTrends,
                recentMonthlyTrends: cached.recentMonthlyTrends
            };
        }


        // Include a limited amount of conversation history.
        const conversation = history.slice(-4)
            .filter(message =>
                message &&
                ['user', 'assistant'].includes(message.role) &&
                typeof message.content === 'string'
            )
            .map(message => ({
                role: message.role,
                content: message.content.slice(0, 500)
            }));

        const prompt = `
        You are an AI construction material purchasing advisor.

        Your job is to help users understand historical construction
        material prices and make informed purchasing decisions.

        RULES:
        - Use only the supplied dataset for price-related claims.
        - Explain monthly and yearly price changes when relevant.
        - Use historical monthly trends to discuss seasonality.
        - Compare lumber, steel, and concrete when requested.
        - Give practical, cautious purchasing suggestions.
        - Do not invent current market prices or future predictions.
        - Historical seasonal patterns do not guarantee future prices.
        - These are Producer Price Indices, not actual retail prices.
        - Do not treat different materials' index values as directly
        comparable dollar prices.
        - Keep answers clear, concise, and conversational.
        - Never describe one material as more expensive than another
        based solely on its price index.
        - A 12-observation period spans 11 monthly intervals.
        - The latest YoY change compares the latest month with the
        same month one year earlier.
        - Clearly distinguish overall period changes from YoY changes.
        - Do not claim that different percentage changes are equivalent
        unless they cover exactly the same dates.
        - When discussing purchasing timing, describe historical
        seasonal patterns as possibilities, not guarantees.
        - Avoid lengthy tables unless they improve the answer.
        - Keep responses concise and easy to read in a narrow dashboard panel.
        - Prefer short paragraphs and bullet points over wide tables.
        - Use tables only when they significantly improve clarity.
        - Avoid repeating the same statistics in multiple sections.
        - Limit most responses to approximately 150-250 words unless
        the user explicitly requests a detailed analysis.
        - Help contractors understand how material price changes
        could affect their construction project budgets.
        - When users provide material budgets and hypothetical
        percentage changes, calculate the additional costs
        and updated total budget.
        - Clearly distinguish hypothetical cost scenarios from
        historical price changes and future predictions.
        - Do not assume project budgets, quantities, or prices
        that the user has not provided.
        - Show calculations clearly and verify the arithmetic.
        - MoM and YoY values are percentages, not index points.
        - Volatility values represent the standard deviation of
        monthly percentage changes, expressed in percentage points.
        - Distinguish changes in index points from percentage changes.
        - Historical price movements alone do not establish their causes.
        - Do not attribute price changes to supply, demand, tariffs,
        or other economic events without supporting evidence.
        - When the available data cannot answer a question,
        explicitly acknowledge that limitation.
        - When citing specific index values, use the exact values
        supplied in the dataset. Never estimate or invent them.
        - If an exact value is unavailable, say so rather than
        providing an approximate value.

        Selected material: ${material}
        Dashboard date range: ${dateRange}

        The user's question takes priority over dashboard filters.
        If the user specifies a material or time period, analyze that
        material or period instead of the dashboard selection.

        If the question is ambiguous, use the dashboard's selected
        material and date range as defaults.

        Use the provided period summaries for historical comparisons.
        Do not confuse overall period changes with MoM or YoY values.
        Do not invent values for dates or periods not supplied.

        Material data:
        ${JSON.stringify(materialContext)}

        Previous conversation:
        ${JSON.stringify(conversation)}

        User question:
        ${question}
        `;

        const answer = await askAI(prompt);

        res.json({ answer });

    } catch (error) {
        console.error('AI insights error:', error.message);

        res.status(500).json({
            error: 'Unable to generate AI insights right now.'
        });
    }
});

export default router;
