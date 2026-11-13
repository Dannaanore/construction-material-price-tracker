import express from 'express';
import cors from 'cors';
import materialsRouter from './routes/materials.js';
import { initializeCache } from './services/materialCache.js';
import 'dotenv/config';
import insightsRouter from './routes/insights.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Register material price data route
app.use('/api/materials', materialsRouter);

// Register ai analyst route
app.use('/api/insights', insightsRouter);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Construction Material Tracker API is running'
    });
});

// Initialize cache before starting the server
try {
    await initializeCache();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize material cache:', error);
    process.exit(1);
}
