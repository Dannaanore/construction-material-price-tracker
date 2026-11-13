import fs from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Materials lookup table
const MATERIALS = {
    lumber: {
        file: 'lumber_wood_products.csv',
        seriesId: 'WPU08'
    },
    steel: {
        file: 'iron_steel_products.csv',
        seriesId: 'WPU101'
    },
    concrete: {
        file: 'concrete_products.csv',
        seriesId: 'WPU133'
    }
};

/*
* Read and parse the CSV file.
* Return an array of {date, value } objects.
*
*/
export async function loadMaterialData(material) {
    // Get material info
    const materialInfo = MATERIALS[material];

    // Verify material exists
    if (!materialInfo) {
        throw new Error(`Unknown material: ${material}`);
    }

    // Construct path to CSV file
    const filePath = path.join(__dirname, '..', 'data', materialInfo.file);

    // Read file as string
    const csvContentString = await fs.readFile(filePath, 'utf8');

    // Parse Data
    const parsedData = Papa.parse(csvContentString, {
        header: true,
        skipEmptyLines: true
    });

    // Clean data
    const cleanedData = parsedData.data.map((row) => {
        return {
            date: row.observation_date,
            value: Number(row[materialInfo.seriesId])
        };
    })
        // Keep only valid price index values > 0
        .filter((row) => Number.isFinite(row.value) && row.value > 0)
        .sort((a, b) => a.date.localeCompare(b.date));

    return cleanedData;
};