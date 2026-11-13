import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateMoMYoY,
    calculateVolatility,
    calculatePriceMetrics,
} from '../services/calculatePriceMetrics.js';

/*
 * Unit tests for price metric calculations.
 * Uses known values to verify calculations and edge cases.
 */

// Create monthly price data starting January 2025
function createMonthlyData(values) {
    const data = [];

    for (let i = 0; i < values.length; i++) {
        const date = new Date(Date.UTC(2025, i, 1));

        data.push({
            date: date.toISOString().slice(0, 10),
            value: values[i]
        });
    }

    return data;
}

// Test MoM increases and decreases
test('calculates MoM correctly', () => {
    const data = createMonthlyData([100, 110, 99]);
    const results = calculateMoMYoY(data);

    assert.equal(results[0].MoM, null);
    assert.equal(results[1].MoM, 10);
    assert.ok(Math.abs(results[2].MoM + 10) < 0.000001);
});

// Test YoY using the same month from the previous year
test('calculates YoY correctly', () => {
    const data = createMonthlyData([
        100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100,
        120
    ]);

    const results = calculateMoMYoY(data);

    assert.equal(results[0].YoY, null);
    assert.equal(results[12].YoY, 20);
});

// Test missing monthly observations
test('handles missing dates', () => {
    const data = [
        { date: '2025-01-01', value: 100 },
        { date: '2025-03-01', value: 120 },
        { date: '2026-03-01', value: 150 }
    ];

    const results = calculateMoMYoY(data);

    assert.equal(results[1].MoM, null);
    assert.equal(results[2].MoM, null);
    assert.equal(results[2].YoY, 25);
});

// Test volatility with insufficient historical data
test('returns null when there is not enough data for volatility', () => {
    const data = calculateMoMYoY(
        createMonthlyData(Array(12).fill(100))
    );

    const results = calculateVolatility(data);

    assert.equal(results[11].volatility, null);
});

// Test constant prices
test('returns zero volatility for constant prices', () => {
    const data = calculateMoMYoY(
        createMonthlyData(Array(13).fill(100))
    );

    const results = calculateVolatility(data);

    assert.equal(results[12].volatility, 0);
});

// Test volatility with known monthly changes
test('calculates volatility correctly', () => {
    const data = [];

    // Alternate between +10% and -10% for 12 months
    for (let i = 0; i < 12; i++) {
        data.push({
            date: new Date(Date.UTC(2025, i, 1)).toISOString().slice(0, 10),
            value: 100,
            MoM: i % 2 === 0 ? 10 : -10
        });
    }

    const results = calculateVolatility(data);

    // Average = 0, variance = 100, volatility = 10
    assert.equal(results[11].volatility, 10);
});

// Test missing monthly changes
test('returns null volatility when a monthly change is missing', () => {
    const data = [];

    for (let i = 0; i < 12; i++) {
        data.push({
            date: new Date(Date.UTC(2025, i, 1)).toISOString().slice(0, 10),
            value: 100,
            MoM: i === 5 ? null : 2
        });
    }

    const results = calculateVolatility(data);

    assert.equal(results[11].volatility, null);
});

// Test combined metric output
test('combines all metrics correctly', () => {
    const data = createMonthlyData(Array(13).fill(100));
    const results = calculatePriceMetrics(data);

    assert.equal(results.length, 13);
    assert.equal(results[12].MoM, 0);
    assert.equal(results[12].YoY, 0);
    assert.equal(results[12].volatility, 0);
});

// Test division by zero
test('handles zero previous values', () => {
    const data = createMonthlyData([
        0, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100,
        120
    ]);

    const results = calculateMoMYoY(data);

    assert.equal(results[1].MoM, null);
    assert.equal(results[12].YoY, null);
});

test('volatility uses the most recent 12 monthly changes', () => {
    const data = [];

    for (let i = 0; i < 13; i++) {
        data.push({
            date: new Date(Date.UTC(2025, i, 1))
                .toISOString().slice(0, 10),
            value: 100,
            MoM: i === 0 ? 100 : 0
        });
    }

    const results = calculateVolatility(data);

    // First window contains one 100% change and eleven 0% changes.
    assert.ok(results[11].volatility > 0);

    // Next window excludes the 100% change.
    assert.equal(results[12].volatility, 0);
});