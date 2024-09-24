// Import required modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

// Initialize the Express application
const app = express();

// Middleware to handle JSON requests and enable CORS for frontend-backend communication
app.use(express.json());
app.use(cors());

// Import the OpenAI route
import openAIRoute from './api/openai/index.mjs';
app.use('/api/openai', openAIRoute);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});
