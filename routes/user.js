import express from 'express'

import { login, googleLogin, signup, doesEmailExist } from '../controllers/user.js'

const router = express.Router()

// localhost:5000/user
router.post('/login', login)
router.post('/auth/google', googleLogin)
router.post('/signup', signup)
router.post('/doesEmailExist', doesEmailExist)

export default router