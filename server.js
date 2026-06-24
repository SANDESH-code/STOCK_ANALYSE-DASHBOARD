const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
dest:"uploads/"
});

const db = new sqlite3.Database(
  "./ticketbridge.db"
);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.exec(`
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS ratings;
    DROP TABLE IF EXISTS waitlist;
    DROP TABLE IF EXISTS verifiedTickets;
    DROP TABLE IF EXISTS chats;
    DROP TABLE IF EXISTS requests;
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS sellers;
    DROP TABLE IF EXISTS users;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      profileImage TEXT,
      rating REAL DEFAULT 5.0,
      verified INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      ticketsSold INTEGER DEFAULT 0,
      trustScore REAL DEFAULT 100,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketCode TEXT UNIQUE,
      eventName TEXT,
      eventType TEXT,
      eventDate TEXT,
      eventLocation TEXT,
      seatNumber TEXT,
      originalPrice REAL,
      sellingPrice REAL,
      suggestedPrice REAL,
      imagePath TEXT,
      sellerId INTEGER,
      verified INTEGER DEFAULT 0,
      heatScore INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Available',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sellerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketId INTEGER,
      buyerId INTEGER,
      status TEXT DEFAULT 'Pending',
      requestDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticketId) REFERENCES tickets(id),
      FOREIGN KEY(buyerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER,
      receiverId INTEGER,
      message TEXT,
      sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS verifiedTickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketCode TEXT UNIQUE,
      verified INTEGER DEFAULT 1,
      scannedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketId INTEGER,
      userId INTEGER,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticketId) REFERENCES tickets(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sellerId INTEGER,
      buyerId INTEGER,
      rating INTEGER,
      review TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sellerId) REFERENCES users(id),
      FOREIGN KEY(buyerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      message TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `, (err) => {
    if (err) {
      console.error("Failed to create schema:", err);
    }
  });
});

// USER ROUTES

app.post("/users",(req,res)=>{
  const {
    name,
    email,
    password,
    profileImage
  } = req.body;

  db.run(
    `
INSERT INTO users(
name,
email,
password,
profileImage
)
VALUES(?,?,?,?)
`,
    [
      name,
      email,
      password || null,
      profileImage || null
    ],
    function(err){
      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true,
        id:this.lastID
      });
    }
  );
});

app.get("/users",(req,res)=>{
  db.all(
    "SELECT * FROM users",
    [],
    (err,rows)=>{
      if(err){
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

// ADD TICKET

app.post("/ticket",(req,res)=>{
  const {
    ticketCode,
    eventName,
    eventType,
    eventDate,
    eventLocation,
    seatNumber,
    originalPrice,
    sellingPrice,
    suggestedPrice,
    imagePath,
    sellerId,
    verified,
    heatScore,
    status
  } = req.body;

  const finalOriginalPrice = originalPrice != null ? originalPrice : 0;
  const finalSellingPrice = sellingPrice != null ? sellingPrice : finalOriginalPrice;
  const finalSuggestedPrice = suggestedPrice != null ? suggestedPrice : finalSellingPrice;
  const finalVerified = verified ? 1 : 0;

  db.run(
    `
INSERT INTO tickets(
ticketCode,
eventName,
eventType,
eventDate,
eventLocation,
seatNumber,
originalPrice,
sellingPrice,
suggestedPrice,
imagePath,
sellerId,
verified,
heatScore,
status
)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`,
    [
      ticketCode,
      eventName,
      eventType,
      eventDate,
      eventLocation || null,
      seatNumber || null,
      finalOriginalPrice,
      finalSellingPrice,
      finalSuggestedPrice,
      imagePath || null,
      sellerId || null,
      finalVerified,
      heatScore || 0,
      status || "Available"
    ],
    function(err){
      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true,
        id:this.lastID
      });
    }
  );
});

// GET TICKETS

app.get("/tickets",(req,res)=>{
  db.all(
    "SELECT * FROM tickets",
    [],
    (err,rows)=>{
      if(err){
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

// REQUEST

app.post("/request",(req,res)=>{
  const {
    ticketId,
    buyerId,
    status
  } = req.body;

  db.run(
    `
INSERT INTO requests(
ticketId,
buyerId,
status
)
VALUES(?,?,?)
`,
    [
      ticketId,
      buyerId || null,
      status || "Pending"
    ],
    function(err){
      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true,
        id:this.lastID
      });
    }
  );
});

// GET REQUESTS

app.get("/requests",(req,res)=>{
  db.all(
    "SELECT * FROM requests",
    [],
    (err,rows)=>{
      if(err){
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

// CHAT

app.post("/chat",(req,res)=>{
  const {
    senderId,
    receiverId,
    message
  } = req.body;

  db.run(
    `
INSERT INTO chats(
senderId,
receiverId,
message
)
VALUES(?,?,?)
`,
    [
      senderId || null,
      receiverId || null,
      message
    ],
    function(err){
      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true,
        id:this.lastID
      });
    }
  );
});

// GET CHATS

app.get("/chat",(req,res)=>{
  db.all(
    "SELECT * FROM chats",
    [],
    (err,rows)=>{
      if(err){
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

app.listen(5000,()=>{
  console.log("Server Running On Port 5000");

});