
//test
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const messageRoutes = require('./routes/messageRoutes');

// const PORT = process.env.PORT || 3003;
const PORT = 3003;
console.log(PORT);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'FrontEnd')));
app.use(express.urlencoded({ extended: true }));
app.use('/api', messageRoutes);
app.use("/Models/uploads", express.static(path.join(__dirname, "uploads")));

const mongoURI = "mongodb://imeldaalexisjbaru:1Gh8Y4DxDNf8GB47@cluster0-shard-00-00.g70d8.mongodb.net:27017,cluster0-shard-00-01.g70d8.mongodb.net:27017,cluster0-shard-00-02.g70d8.mongodb.net:27017/chatAppRevisi?replicaSet=atlas-9d8ugm-shard-0&ssl=true&authSource=admin"
console.log(mongoURI);

mongoose.connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.once('open', () => { //maybe add chatAppRevisi here?
  console.log('Connected to MongoDB database chatAppRevisi');
});

// app.get('/', async(req, res) => {
//   return res.status(200).send("Successful");
// })
app.get("/", async(req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd', 'index_coba.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
