/*
 * Create lookup table of dates and their price indicies.
 * Return Map of dates as keys and price indices as values.
 */
function createPriceMap(data) {
    const priceByDate = new Map();

    data.forEach(element => {
        priceByDate.set(element.date, element.value);
    });

    return priceByDate
}

/*
 * Calculate month-over-month and year-over-year percentage change.
 * Return array of MoM and YoY values.
 * Uses a look up table to handle missing dates.
 */
export function calculateMoMYoY(data) {
    const priceByDate = createPriceMap(data);
    const results = [];

    for (let i = 0; i < data.length; i++) {
        const currRow = data[i];
        const currDate = new Date(currRow.date);

        let MoM = null;
        let YoY = null;

        // Calculate MoM
        // Find previous month
        const prevMonthDate = new Date(currDate);
        prevMonthDate.setUTCMonth(prevMonthDate.getUTCMonth() - 1);

        // Retreive previous month's value
        const prevMonthKey = prevMonthDate.toISOString().slice(0, 10);
        const prevMonthValue = priceByDate.get(prevMonthKey);

        if (prevMonthValue !== undefined && prevMonthValue !== 0) {
            MoM = ((currRow.value - prevMonthValue) / prevMonthValue) * 100;
        }

        // Calculate YoY
        // Find previous year
        const prevYearDate = new Date(currDate);
        prevYearDate.setUTCFullYear(prevYearDate.getUTCFullYear() - 1);

        // Retreive previous year's value
        const prevYearKey = prevYearDate.toISOString().slice(0, 10);
        const prevYearValue = priceByDate.get(prevYearKey);

        if (prevYearValue !== undefined && prevYearValue !== 0) {
            YoY = ((currRow.value - prevYearValue) / prevYearValue) * 100;
        }

        // Store results
        results.push({
            date: currRow.date,
            value: currRow.value,
            MoM: MoM,
            YoY: YoY
        });
    }

    return results;
}

/*
 * Calculate rolling 12-month volatility.
 * Uses the MoM percentage changes.
 */
export function calculateVolatility(data) {
    const results = [];

    for (let i = 0; i < data.length; i++) {
        let volatility = null;
        let monthlyChanges = [];
        let validRange = true;

        // Need at least 12 months of MoM changes
        if (i >= 11) {
            for (let j = i - 11; j <= i; j++) {
                if (data[j].MoM === null) {
                    validRange = false;
                    break;
                }

                monthlyChanges.push(data[j].MoM);
            }
        } else {
            validRange = false;
        }

        if (validRange) {
            let sum = 0;

            // Add all 12 monthly percentage changes
            for (let j = 0; j < monthlyChanges.length; j++) {
                sum += monthlyChanges[j];
            }

            // Calculate the average
            const average = sum / 12;

            let squaredSum = 0;

            // Calculate how far each monthly change is from the average
            for (let j = 0; j < monthlyChanges.length; j++) {
                const difference = monthlyChanges[j] - average;
                squaredSum += difference ** 2;
            }

            // Calculate population variance
            const variance = squaredSum / 12;

            // Standard deviation is our volatility
            volatility = Math.sqrt(variance);
        }

        results.push({
            date: data[i].date,
            value: data[i].value,
            volatility: volatility
        });


    }

    return results;
}

/*
 * Combines calculated data into single array.
 */
export function calculatePriceMetrics(data){
    const calcPercentChange = calculateMoMYoY(data);
    const calcVolatility = calculateVolatility(calcPercentChange);

    const combinedData = [];

    for (let i = 0; i < calcPercentChange.length; i++) {
        combinedData.push({
            date: calcPercentChange[i].date,
            value: calcPercentChange[i].value,
            MoM: calcPercentChange[i].MoM,
            YoY: calcPercentChange[i].YoY,
            volatility: calcVolatility[i].volatility
        });
    }

    return combinedData;
}