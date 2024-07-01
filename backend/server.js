import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import router from './routes.js';
import cookieParser from 'cookie-parser';
import connectDB from './database.js';
import initilizeSocket from './socket/index.js';
const PORT = process.env.PORT || 8080;
const app = express();

// Start the server
export const server = app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});

// Initialize socket.io server
initilizeSocket(server)


// Connect to MongoDB
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process if DB connection fails
});

// Use cookie parser middleware
app.use(cookieParser());

// Set up CORS options
const corsOptions = {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from the 'storage' directory
app.use('/storage', express.static('storage'));

// Parse JSON payloads with a limit of 4MB
app.use(express.json({ limit: '4mb' }));

// Set up API routes
app.use("/api/v1", router);

router.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to coders house',
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Handle global errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1); // Exit process on unhandled exception
});


