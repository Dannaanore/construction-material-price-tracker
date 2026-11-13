import test from 'node:test';
import assert from 'node:assert/strict';

import { loadMaterialData } from '../services/parseCsv.js';

/*
 * Tests for loading and cleaning FRED material price data.
 */

// Verify all three material datasets load successfully
test('loads all three material datasets', async () => {
    for (const material of ['lumber', 'steel', 'concrete']) {
        const data = await loadMaterialData(material);

        assert.ok(data.length > 0);
    }
});

// Verify observations have valid dates and positive values
test('returns valid observations', async () => {
    for (const material of ['lumber', 'steel', 'concrete']) {
        const data = await loadMaterialData(material);

        for (const row of data) {
            assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/);
            assert.ok(!Number.isNaN(Date.parse(row.date)));
            assert.ok(Number.isFinite(row.value));
            assert.ok(row.value > 0);
        }
    }
});

// Verify dates are sorted oldest to newest
test('sorts observations chronologically', async () => {
    for (const material of ['lumber', 'steel', 'concrete']) {
        const data = await loadMaterialData(material);

        for (let i = 1; i < data.length; i++) {
            assert.ok(data[i].date > data[i - 1].date);
        }
    }
});

// Verify the known latest lumber observation
test('loads the expected latest lumber value', async () => {
    const data = await loadMaterialData('lumber');
    const latest = data[data.length - 1];

    assert.equal(latest.date, '2026-09-01');
    assert.equal(latest.value, 315.329);
});

// Verify invalid materials are rejected
test('rejects an unknown material', async () => {
    await assert.rejects(
        loadMaterialData('invalid'),
        /Unknown material/
    );
});
