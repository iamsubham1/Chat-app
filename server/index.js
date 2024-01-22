const express = require('express')
const app = express()
const port = 8080
const connectToMongo = require('./db')



const startServer = async () => {

    try {
        app.use(express.json());


        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/user', require('./routes/user'));
        app.use('/api/chat', require('./routes/chat'));


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