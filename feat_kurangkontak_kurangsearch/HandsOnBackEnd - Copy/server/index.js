const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3003;


mongoose.connect('mongodb://localhost:27017/chatAppRevisi')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'client')));

const MessageSchema = new mongoose.Schema(
  {
    _data: {
      id: {
        fromMe: { type: Boolean, required: true },
        remote: { type: String, required: true },
        id: { type: String, required: true },
        _serialized: { type: String, required: true },
      },
      viewed: { type: Boolean, default: false },
      body: { type: String, required: true },
      type: { type: String, default: "chat" },
      t: { type: Number, required: true },
      notifyName: { type: String },
      from: { type: String, required: true },
      to: { type: String, required: true },
      ack: { type: Number, default: 1 },
      isNewMsg: { type: Boolean, default: true },
      star: { type: Boolean, default: false },
      hasMedia: { type: Boolean, default: false },
      isForwarded: { type: Boolean, default: false },
      timestamp: { type: Number, required: true },
    },
    id: {
      fromMe: { type: Boolean, required: true },
      remote: { type: String, required: true },
      id: { type: String, required: true },
      _serialized: { type: String, required: true },
    },
    ack: { type: Number, default: 1 },
    hasMedia: { type: Boolean, default: false },
    body: { type: String, required: true },
    type: { type: String, default: "chat" },
    timestamp: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    deviceType: { type: String, default: "web" },
    hasReaction: { type: Boolean, default: false },
    links: { type: [String], default: [] },
  },
  { id: false }
);


const Message = mongoose.model('messages', MessageSchema);
//const User = mongoose.model("user", UserSchema);

app.get('/', async(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index_coba.html'));
})

app.get("/messages", async (req, res) => {
  try {
      const allMessages = await Message.find({}).select('-_id id body from to timestamp'); 
      console.log(`Found ${allMessages.length} messages`); // Log the number of messages found

      return res.json(allMessages); // Return all messages including their messages array
  } catch (error) {
      console.error("Error fetching messages:", error); // Log any errors
      return res.status(500).send(error); // Send a 500 status code for server errors
  }
});




app.get("/messages/:senderId", async (req, res) => {
  try {
      const id = req.params.senderId;
      const message = await Message.findOne({ senderId: id });
  
      
      if (!message) {
          return res.status(404).json({
              error: "Gada datanya wak", 
          });
      }
      
      return res.json(message); 
  } catch (error) {
      return res.status(500).send(error);
  }
});



app.post('/post', async (req, res) => {
  try {
    const { body, currentContact, myContact } = req.body;

    if (!body || !currentContact || !myContact) {
      return res.status(400).send("Missing required fields: body, currentContact, or myContact.");
    }

    const timestamp = Date.now();  // Generate a timestamp

    const newMessage = new Message({
      _data: {
        id: {
          fromMe: true, // Add this field to the `_data.id` structure
          remote: currentContact,
          id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          _serialized: `true_${currentContact}_${timestamp}`
        },
        viewed: false,
        body,
        type: "chat",
        t: Math.floor(timestamp / 1000),  // Unix timestamp
        notifyName: "You",
        from: myContact,
        to: currentContact,
        ack: 1,
        isNewMsg: true,
        star: false,
        recvFresh: true,
        viewMode: "VISIBLE",
        timestamp  // Include the timestamp here
      },
      id: { // This is the top-level `id` structure
        fromMe: true, // Ensure consistency with `_data.id`
        remote: currentContact,
        id: `${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        _serialized: `true_${currentContact}_${timestamp}`
      },
      ack: 1,
      hasMedia: false,
      body,
      type: "chat",
      timestamp,  // Top-level timestamp
      from: myContact,
      to: currentContact,
      deviceType: "web",
      hasReaction: false,
      links: []
    });
    

    await newMessage.save();
    console.log("Message saved:", newMessage);
    res.redirect("http://localhost:3003");
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).send("Internal server error");
  }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
