const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

const IMG_BB_API_KEY = process.env.IMG_BB_API_KEY;

// Function to upload an image to ImgBB
const uploadToImgBB = async (imageBase64) => {
  try {
    const formData = new URLSearchParams();
    formData.append('image', imageBase64); // Add the base64 image directly

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
      formData
    );

    if (response.data && response.data.data && response.data.data.display_url) {
      return response.data.data.display_url; // Return the URL of the uploaded image
    } else {
      throw new Error('Image upload to ImgBB failed');
    }
  } catch (err) {
    console.error('Error uploading image to ImgBB:', err);
    throw err;
  }
};

// Route to handle user submissions
router.post('/', async (req, res) => {
  try {
    const { name, socialHandle, images } = req.body;
    const imageUrls = [];

    for (const imageBase64 of images) {
      const imageUrl = await uploadToImgBB(imageBase64);
      imageUrls.push(imageUrl);
    }

    const user = new User({ name, socialHandle, images: imageUrls });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Error during user data saving:', err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// Route for fetching all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
