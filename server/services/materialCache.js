import { loadMaterialData } from './parseCsv.js';
import { calculatePriceMetrics } from './calculatePriceMetrics.js';
import { calculateHistoricalMonthlyTrends } from './calculateHistoricalMonthlyTrends.js';

// Store processed data for each material
const materialCache = new Map();

/*
 * Load and calculate all material data when the server starts.
 * Store the processed results in a Map.
 */
export async function initializeCache() {
    const materials = ['lumber', 'steel', 'concrete'];

    for (const material of materials) {
        // Load and clean CSV data
        const cleanedData = await loadMaterialData(material);

        // Calculate MoM, YoY, and volatility
        const calculatedData = calculatePriceMetrics(cleanedData);

        // Calculate all-time historical monthly trends
        const historicalMonthlyTrends = calculateHistoricalMonthlyTrends(calculatedData);

        // Calculate historical monthly trends for the last 10 years
        const recentMonthlyTrends = calculateHistoricalMonthlyTrends(calculatedData, 10);

        // Store all processed data
        materialCache.set(material, {
            data: calculatedData,
            historicalMonthlyTrends: historicalMonthlyTrends,
            recentMonthlyTrends: recentMonthlyTrends
        });

        /* Tests
        console.log(`Cached ${material}: ${calculatedData.length} observations`);
        console.log(material, historicalMonthlyTrends);

        console.log(`${material} all-time:`, historicalMonthlyTrends);
        console.log(`${material} last 10 years:`, recentMonthlyTrends);
        */
    }
}

/*
 * Retrieve processed data from the cache.
 */
export function getMaterialData(material) {
    return materialCache.get(material);
}
