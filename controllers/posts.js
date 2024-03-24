import PostModel from "../models/postModel.js"
import mongoose from "mongoose"

export const getPosts = async (req, res) => {
  const { page } = req.query
  try {
    const LIMIT = 6
    const startIndex = (Number(page) - 1) * LIMIT
    const total = await PostModel.countDocuments({})

    const posts = await PostModel.find().sort({_id: -1}).limit(LIMIT).skip(startIndex)

    res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)})
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query
  try {
    const title = new RegExp(searchQuery, "i")
    const posts = await PostModel.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] })
    res.status(200).json(posts)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getPost = async (req, res) => {
  const { id } = req.params
  try {
    const post = await PostModel.findById(id)
    res.status(200).json(post)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const createPost = async (req, res) => {
  const post = req.body
  const newPost = new PostModel({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

  try {
    await newPost.save()
    res.status(201).json(newPost)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}

export const updatePost = async (req, res) => {
  const { id: _id } = req.params
  const post = req.body
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with that id')
  
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(_id, post, { new: true })
    res.json(updatedPost)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}

export const deletePost = async (req, res) => {
  const { id: _id } = req.params
  if (!mongoose.Types.ObjectId.isValid(_id)) 
    return res.status(404).send('No post with that id')

  try {
    await PostModel.findByIdAndDelete(_id)
    res.json(_id)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}

export const likePost = async (req, res) => {
  const {id: _id} = req.params
  if (!req.userId) return res.json({ message: 'Unauthenticated' })
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with that id')
  try {
    const post = await PostModel.findById(_id)
    const index = post.likes.findIndex((id) => id === String(req.userId))
    if (index === -1) {
      // like the post
      post.likes.push(req.userId)
    } else {
      // dislike the post
      post.likes = post.likes.filter((id) => id !== String(req.userId))
    }
    const likedPost = await PostModel.findByIdAndUpdate(_id, post, {new: true})
    res.json(likedPost)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}