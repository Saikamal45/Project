require('dotenv').config();
const express=require('express');
const path=require('path');
const bodyParser = require('body-parser');
const app=express();
const mongoose=require('mongoose');
const cors=require('cors');
app.use(cors());

const Image=require('./Image');
const upload = require('./uploads');
const uploadController = require('./uploadcontroller');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://Kamal:Saikamal@cluster0.gzq7nmj.mongodb.net/?retryWrites=true&w=majority'
, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/Files', express.static(path.join(__dirname,'Files')));
app.use(uploadController);

const port=process.env.PORT||3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});