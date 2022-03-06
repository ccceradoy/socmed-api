const express = require('express');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();

// Server will be on this port
const PORT = process.env.PORT || 3000;

// Connect to the database
const connectDB = require('./config/database');
connectDB();

// Routes and Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('morgan')('tiny'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/posts', require('./routes/postRoute'));

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});