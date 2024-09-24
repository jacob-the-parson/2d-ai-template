// Import necessary modules
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the OpenAI API with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set in your .env file
});

// Create an Express router
const router = express.Router();

// Route to handle NPC interaction
router.post('/getResponse', async (req, res) => {
  const npcPrompt = req.body.prompt;

  try {
    // Send a request to the OpenAI API to generate a response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // GPT model
      messages: [
        { role: "system", content: "You are an old wise man NPC in a 2D game world." },
        { role: "user", content: npcPrompt }
      ],
      max_tokens: 1000,    // Adjust the response length as needed
      temperature: 0.7,   // Controls response creativity
    });

    // Extract and send the response back to the frontend
    const npcResponse = response.choices[0].message.content;
    res.json({ response: npcResponse });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Error communicating with OpenAI API', details: error.message });
  }
});

// Export the router for use in the main index.js
export default router;
