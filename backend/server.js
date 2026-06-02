const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Need increased limit for potentially large payload if face descriptor is large, though 128 floats isn't that big
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/leaverequests', require('./routes/leaverequests'));
app.use('/api/contact', require('./routes/contact'));

app.get('/api/health/ai', async (req, res) => {
    const ollamaBaseUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const chromaBaseUrl = process.env.CHROMA_URL || 'http://127.0.0.1:8000';

    const checkService = async (url) => {
        try {
            const response = await fetch(url, { method: 'GET' });
            return response.ok;
        } catch (err) {
            return false;
        }
    };

    const [ollamaReady, chromaReady] = await Promise.all([
        checkService(`${ollamaBaseUrl}/api/tags`),
        checkService(`${chromaBaseUrl}/api/v2/heartbeat`)
    ]);

    const statusCode = ollamaReady && chromaReady ? 200 : 503;
    res.status(statusCode).json({
        status: statusCode === 200 ? 'ok' : 'degraded',
        services: {
            ollama: ollamaReady,
            chroma: chromaReady
        }
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
