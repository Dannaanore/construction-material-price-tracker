/*
 * Calculate historical average MoM percentage changes
 * for each calendar month.
 *
 * If years is provided, only use data from the
 * specified number of years.
 */
export function calculateHistoricalMonthlyTrends(data, years = null) {
    let filteredData = data;

    // Filter to the last specified number of years
    if (years !== null && data.length > 0) {
        const latestDate = new Date(data[data.length - 1].date);

        const cutoffDate = new Date(latestDate);
        cutoffDate.setUTCFullYear(cutoffDate.getUTCFullYear() - years);

        filteredData = data.filter((row) => {
            return new Date(row.date) > cutoffDate;
        });
    }

    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        averageMoM: null,
        count: 0
    }));

    const totals = Array(12).fill(0);

    // Group historical MoM changes by calendar month
    for (const row of filteredData) {
        if (row.MoM === null || !Number.isFinite(row.MoM)) {
            continue;
        }

        const monthIndex = Number(row.date.slice(5, 7)) - 1;

        totals[monthIndex] += row.MoM;
        months[monthIndex].count++;
    }

    // Calculate average MoM change for each month
    for (let i = 0; i < 12; i++) {
        if (months[i].count > 0) {
            months[i].averageMoM = totals[i] / months[i].count;
        }
    }

    return months;
}
