const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:6161');

// Event listener when the WebSocket connection is established
ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

// Event listener when a message is received from the WebSocket server
ws.on('message', (data) => {
  try {
    // If the data is in Buffer format, convert it to string
    const jsonString = data.toString();
    
    // Parse the string as JSON
    const message = JSON.parse(jsonString);

    // To show the entire object properly, we use JSON.stringify
    console.log('Received message:', JSON.stringify(message, null, 2));  // Pretty print the JSON

  } catch (error) {
    console.error('Error parsing message:', error.message);
  }
});

// Event listener for WebSocket errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

// Event listener for WebSocket connection close
ws.on('close', () => {
  console.log('WebSocket connection closed');
});
