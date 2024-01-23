const express = require('express')
const app = express()
const port = 8080
const connectToMongo = require('./db')
const cors = require('cors')

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: "GET,POST,PUT,PATCH,DELETE,HEAD",
    credentials: true
}
app.use(cors(corsOptions))


const startServer = async () => {

    try {
        app.use(express.json());

        //authentication routes
        app.use('/api/auth', require('./routes/auth'));

        // user action routes
        app.use('/api/user', require('./routes/user'));

        //chat routes
        app.use('/api/chat', require('./routes/chat'));

        //message routes
        app.use('/api/message', require('./routes/message'));

        // health route
        app.get('/health', (req, res) => {
            res.send('server health is ok')

        })

        app.listen(port, () => {
            console.log(`server is running on ${port}`)
        })
    }
    catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }

}

const initializeApp = async () => {
    await connectToMongo()
    await startServer()


}
initializeApp()