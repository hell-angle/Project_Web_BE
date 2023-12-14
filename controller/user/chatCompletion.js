const mongoose = require("mongoose");
const Users = require("../../model/users");

// Define a schema for chat messages
const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Assuming you have a Users model for storing user information
    required: false,
  },
  message: {  // Change 'messages' to 'message' for consistency
    type: String,
    default: "",
  }
});

// Create a Chat model based on the schema
const Chat = mongoose.model("Chat", chatSchema);

const { Configuration, OpenAIApi } = require("openai");

const openAIConfig = new Configuration({
  apiKey: process.env.apiKey
});

const openapi = new OpenAIApi(openAIConfig);

const chatCompletion = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Save the user's message in the database
    const userMessage = new Chat({
      user: req.user, // Assuming you have user information stored in req.user
      message: prompt,
    });

    await userMessage.save();

    const answer = await openapi.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 3000
    });

    const text = answer.data.choices[0].text;

    // Save the AI's response in the database
    const aiMessage = new Chat({
      user: null, // You can set this to null or some predefined value for AI messages
      message: text,
    });

    await aiMessage.save();

    res.status(200).json({ text });
  } catch (err) {
    console.error("Error processing chat:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = chatCompletion;
