import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import postRoutes from './routes/posts.js'
import userRoutes from './routes/user.js'

const app = express()
dotenv.config()

app.use(express.json({ limit: '30mb', extended: true }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())

app.use('/posts', postRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res) => {
  res.send('Hello from Memories API')
})

const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT || 5000

const ConnectToDB = async () => {
  const connection = {}
  try {
    if (connection.isConnected) return
    const db = await mongoose.connect(CONNECTION_URL)
    connection.isConnected = db.connections[0].readyState
    console.log('Connected to MongoDB')
  } catch (error) {
    console.log(error.message)
  }
}

ConnectToDB()
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))