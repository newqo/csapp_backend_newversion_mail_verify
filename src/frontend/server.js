const express = require('express');
const cors = require('cors'); // Import CORS middleware
const path = require('path');
const app = express();
const { domain, port } = require('./utils/domain');
const ports = 81;

app.use(cors({
    origin: `http://${domain}:${port}`, 
    methods: ['GET', 'POST'],       
    credentials: true                
}));

// Serve static files (this serves your frontend)
app.use(express.static(path.join(__dirname, './')));

// Define your route to serve the frontend page
app.get('/reset-password/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Start the frontend server
app.listen(ports, () => {
  console.log(`Frontend is running on http://localhost:${ports}`);
});
