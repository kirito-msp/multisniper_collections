require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const config = require('./config.json'); // Use the config.json to get MongoDB values

const app = express();
const PORT = 3540;

// Destructure the MongoDB configuration for easier use
const { user, password, host, port, database } = config.mongodb;

// Build the connection URI
const mongoUri = `mongodb://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=multiChainApi`;

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies


// Use API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
