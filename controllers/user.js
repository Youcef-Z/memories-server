import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import User from '../models/userModel.js'

const jwtSecret = process.env.JWT_SECRET

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (!existingUser) return res.status(404).json({ message: "Invalid credentials" })
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid credentials" })
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, `${jwtSecret}`, { expiresIn: "1h" })
    res.status(200).json({ result: existingUser, token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const googleLogin = async (req, res) => {
  const { token } = req.body
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    const data = await response.json()
    console.log(data.sub)
    const email = data.email
    const name = data.name
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, `${jwtSecret}`, { expiresIn: "1h" })
      res.status(200).json({ result: existingUser, token })
    } else {
      const hashedPassword = await bcrypt.hash(email, 12)
      const result = await User.create({ email, password: hashedPassword, name, _id: data.sub})
      const token = jwt.sign({ email: result.email, id: result._id }, `${jwtSecret}`, { expiresIn: "1h" })
      res.status(201).json({ result, token })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  } 
}

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: "User already exists" })
    // if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match" })
    const hashedPassword = await bcrypt.hash(password, 12)
    const result = await User.create({ _id: new mongoose.Types.ObjectId(), email, password: hashedPassword, name: `${firstName} ${lastName}` })
    const token = jwt.sign({ email: result.email, id: result._id }, `${jwtSecret}`, { expiresIn: "1h" })
    res.status(201).json({ result, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const doesEmailExist = async (req, res) => {
  const { email } = req.body
  const existingUser = await User.findOne({ email })
  res.status(200).json({ result: existingUser ? true : false })
}