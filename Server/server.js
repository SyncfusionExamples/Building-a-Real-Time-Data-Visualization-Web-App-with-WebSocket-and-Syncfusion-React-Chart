const WebSocket = require('ws');

// Create a new WebSocket server that listens on port 8080
const wss = new WebSocket.Server({ port: 8080 });
// Listen for new connections to the WebSocket server
wss.on('connection', (ws) => {
  console.log('Client connected');
  const getRandomYValue = () => Math.floor(Math.random() * 100) + 30;

  // Send initial data
  const initialData = [];
  for (let i = 0; i < 10; i++) { // Example: 10 data points
    initialData.push({
      x: new Date().getTime() - (10 - i) * 1000, // Earlier timestamps
      y: getRandomYValue()
    });
  }
  ws.send(JSON.stringify({ initialData }));

  // Send data updates every second
  setInterval(() => {
    const updateData = {
      x: new Date().getTime(),
      y: getRandomYValue()
    };
    ws.send(JSON.stringify({ updateData }));
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');