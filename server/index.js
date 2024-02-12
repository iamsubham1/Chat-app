const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectToMongo = require('./db');
const multer = require('multer')

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

            socket.on('setup', (userData) => {

                console.log(userData._id);
                socket.emit('connected');

            })


            socket.on('joinChat', (room) => {
                socket.join(room);
                console.log("user joined : ", room)
            })


            socket.on('new message', (newMessageReceived) => {
                // console.log(newMessageReceived);
                var chat = newMessageReceived.chat;
                if (!chat.participants) return console.log("chat participants not found")

                chat.participants.forEach((user) => {
                    console.log('Loop iteration for user:', user.id);
                    console.log("sender is:", newMessageReceived.sender);
                    if (user == newMessageReceived.sender._id) return;
                    socket.in(user).emit('message', 'this is new');

                });

            });

            socket.on('global event', (data) => {
                console.log('Received global event:', data);
            });

            socket.onAny((event, ...args) => {
                console.log(`Received event: ${event}`, args);
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
