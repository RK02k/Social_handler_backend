const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Move this up
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // Move this up

app.use('/uploads', express.static('uploads'));  // Optional, can be removed if not used
app.use('/api/users', userRoutes);

const uri = process.env.MONGO_URI;
mongoose.set('strictQuery', false);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('MongoDB connected successfully using Mongoose'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/test-connection', async (req, res) => {
  try {
    const serverStatus = await mongoose.connection.db.admin().command({ ping: 1 });
    res.status(200).json({ message: 'MongoDB is connected', serverStatus });
  } catch (error) {
    res.status(500).json({ message: 'MongoDB connection error', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
