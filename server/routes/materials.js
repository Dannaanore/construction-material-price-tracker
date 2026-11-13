import express from 'express';
import { getMaterialData } from '../services/materialCache.js';

const router = express.Router();

/*
 * GET cached material price data and calculated metrics.
 */
router.get('/:material', (req, res) => {
    try {
        const material = req.params.material;

        // Validate requested material is supported
        if (material !== 'lumber' &&
            material !== 'steel' &&
            material !== 'concrete') {
            return res.status(400).json({
                error: 'Invalid material. Choose lumber, steel, or concrete.'
            });
        }

        // Retrieve cached material data
        const cachedMaterial = getMaterialData(material);

        if (!cachedMaterial) {
            return res.status(500).json({
                error: 'Material data is unavailable.'
            });
        }

        // Return price data to the frontend
        res.json(cachedMaterial.data);

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            error: 'Failed to retrieve material data.'
        });
    }
});

export default router;
