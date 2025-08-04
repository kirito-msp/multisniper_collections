const WebSocket = require('ws');
const express = require('express');

// Create HTTP Server with Express
const app = express();

// Increase the body size limit to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create WebSocket Server
const wss = new WebSocket.Server({ port: 6161 });

// Store connected clients
let connectedClients = [];

// Handle WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Add client to connectedClients array
    connectedClients.push(ws);

    // Send a message to the client once connected
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    // Handle when the client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
        connectedClients = connectedClients.filter(client => client !== ws);
    });
});

// HTTP POST endpoint to send data to WebSocket clients
app.post('/send-data', (req, res) => {
    const data = req.body;
    // Check if data is valid
    if (!data || !data.message) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    // Send the data to all connected WebSocket clients
    connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

    res.status(200).json({ message: 'Data sent to WebSocket clients' });
});

// Start HTTP server
const httpPort = 6160;
app.listen(httpPort, () => {
    console.log(`HTTP server is running on http://localhost:${httpPort}`);
});

// Output to console
console.log('WebSocket server running on ws://localhost:6161');
