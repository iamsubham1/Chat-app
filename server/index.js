const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectToMongo = require('./db');
const port = 8080;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5173",  // Your React application's URL
        methods: ["GET", "POST"],
        credentials: true
    }
});
const corsOptions = {
    origin: 'http://localhost:5173', // Update this with your React application's URL
    methods: "GET,POST,PUT,PATCH,DELETE,HEAD",
    credentials: true
};
app.use(cors(corsOptions));

const startServer = async () => {
    try {
        await connectToMongo();

        app.use(express.json());

        // Authentication routes
        app.use('/api/auth', require('./routes/auth'));

        // User action routes
        app.use('/api/user', require('./routes/user'));

        // Chat routes
        app.use('/api/chat', require('./routes/chat'));

        // Message routes
        app.use('/api/message', require('./routes/message'));

        // Health route
        app.get('/health', (req, res) => {
            res.send('server health is ok');
        });

        // Socket.IO connection
        io.on('connection', (socket) => {

            console.log(`User connected with socket ID: ${socket.id}`);

            // Handle events (e.g., sending/receiving messages)
            socket.on('message', (data) => {
                console.log('Received message:', data);
                io.emit('message', data);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected with socket ID: ${socket.id}`);
            });
        });

        server.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

const initializeApp = async () => {
    await startServer();
};

initializeApp();
