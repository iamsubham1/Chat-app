const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectToMongo = require('./db');
require('dotenv').config()

const port = process.env.PORT || 6060;

const app = express();
const server = http.createServer(app);


const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingInterval: 120000,
});

const corsOptions = {
    origin: process.env.origin,
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

            // Handle joining a room
            socket.on('joinRoom', (room) => {
                socket.join(room);
                console.log(`User ${socket.id} joined room ${room}`);
            });

            // Handle the 'message' event
            socket.on('message', (data) => {
                console.log('Received message:', data.chatId);

                // Broadcast the message to everyone in the specific room
                io.to(data.chatId).emit('message', data);
            });

            // Handle the 'typing' event
            socket.on('typing', ({ chatId, isTyping }) => {
                console.log(`Received typing status from user ${socket.userId} in chat ${chatId}: ${isTyping}`);

                // Broadcast the typing status to everyone in the specific room
                io.to(chatId).emit('typing', { userId: socket.userId, isTyping });
            });

            // Clean up on disconnect
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
