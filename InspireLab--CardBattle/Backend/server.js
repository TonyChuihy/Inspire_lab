const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { execFile } = require("child_process");

const { MongoClient, ObjectId } = require("mongodb");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// MongoDB Configuration
const mongoUrl = "mongodb://localhost:27017";
const dbName = "CardBattle";
let db;

// Connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    db = client.db(dbName);

    // Ensure collections exist and create indexes
    await db
      .collection("students")
      .createIndex({ studentId: 1 }, { unique: true });
    await db.collection("cards").createIndex({ cid: 1 }, { unique: true });
    await db.collection("cards").createIndex({ studentId: 1 });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

// Start server after connecting to database
connectToMongo();

// Student Routes

// Create a new student
app.post("/students", async (req, res) => {
  try {
    const { name, studentId, cardIds = [] } = req.body;

    if (!name || !studentId) {
      return res.status(400).json({ error: "Name and studentId are required" });
    }

    const student = {
      name,
      studentId,
      cardIds,
      createdAt: new Date(),
    };

    const result = await db.collection("students").insertOne(student);
    res.status(201).json({
      message: "Student created successfully",
      student: {
        _id: result.insertedId,
        ...student,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Student ID already exists" });
    }
    res.status(500).json({ error: "Failed to create student" });
  }
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await db.collection("students").find().toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get a specific student by studentId
app.get("/students/:studentId", async (req, res) => {
  try {
    const student = await db
      .collection("students")
      .findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// Update a student
app.put("/students/:studentId", async (req, res) => {
  try {
    const { name, cardIds } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (cardIds) updateData.cardIds = cardIds;

    const result = await db
      .collection("students")
      .updateOne({ studentId: req.params.studentId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete a student
app.delete("/students/:studentId", async (req, res) => {
  try {
    // First, delete all cards owned by this student
    await db
      .collection("cards")
      .deleteMany({ studentId: req.params.studentId });

    // Then delete the student
    const result = await db
      .collection("students")
      .deleteOne({ studentId: req.params.studentId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student and associated cards deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// Set up multer storage for monster images
const monsterImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "uploads", "monsterImages");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Use card cid + original extension
    // const ext = path.extname(file.originalname);
    cb(null, `${req.body.cid || Date.now()}.png`);
  },
});
const uploadMonster = multer({ storage: monsterImageStorage });

// Serve static files for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Card Routes

// Create a new card
app.post("/cards", uploadMonster.single("monsterImage"), async (req, res) => {
  try {
    const {
      cid,
      studentId,
      monsterName,
      monsterAttribute,
      skill1Attribute,
      skill2Attribute,
      skill1Attack,
      skill2Attack,
    } = req.body;

    if (!cid || !studentId || !monsterName || !monsterAttribute) {
      return res.status(400).json({
        error: "CID, studentId, monsterName, and monsterAttribute are required",
      });
    }

    // Check if student exists
    const student = await db.collection("students").findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Save monster image path
    let monsterImagePath = "";
    if (req.file) {
      monsterImagePath = `/uploads/monsterImages/${cid}.png`;
    }

    // Generate card front/back images (placeholder logic)
    const cardFrontImagePath = `uploads/cardFrontImages/${cid}_front.png`;
    const cardBackImagePath = `uploads/cardBackImages/${cid}_back.png`;
    // TODO: Generate and save actual images here
    fs.mkdirSync(path.join(__dirname, "uploads", "cardFrontImages"), {
      recursive: true,
    });
    fs.mkdirSync(path.join(__dirname, "uploads", "cardBackImages"), {
      recursive: true,
    });
    // fs.writeFileSync(path.join(__dirname, cardFrontImagePath), ""); // Placeholder
    // fs.writeFileSync(path.join(__dirname, cardBackImagePath), ""); // Placeholder

    const card = {
      cid,
      studentId,
      createdAt: new Date(),
      monsterName,
      monsterImage: monsterImagePath,
      cardFrontImage: cardFrontImagePath,
      cardBackImage: cardBackImagePath,
      monsterAttribute,
      skill1Attribute: skill1Attribute || "",
      skill2Attribute: skill2Attribute || "",
      skill1Attack: skill1Attack || 0,
      skill2Attack: skill2Attack || 0,
    };
    // Call Python script to process card images
    await execFile(
      "python",
      ["cardProcess.py", JSON.stringify(card)],
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error:", error);
          return;
        }
        console.log("Output:", stdout);
      }
    );
    let cardResult;
    try {
      cardResult = await db.collection("cards").insertOne(card);
      const updateResult = await db
        .collection("students")
        .updateOne({ studentId }, { $addToSet: { cardIds: cid } });
      if (updateResult.modifiedCount === 0) {
        throw new Error("Student not found or card ID already exists");
      }
    } catch (err) {
      // Clean up images if they were created
      if (monsterImagePath) {
        fs.unlink(path.join(__dirname, monsterImagePath), () => {});
      }
      fs.unlink(path.join(__dirname, cardFrontImagePath), () => {});
      fs.unlink(path.join(__dirname, cardBackImagePath), () => {});
      if (cardResult?.insertedId) {
        await db.collection("cards").deleteOne({ _id: cardResult.insertedId });
      }
      throw err;
    }

    res.status(201).json({
      message: "Card created successfully",
      card,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Card ID already exists" });
    }
    res.status(500).json({
      error: "Failed to create card, server reported: " + err.message,
    });
  }
});

// Get all cards
app.get("/cards", async (req, res) => {
  try {
    const cards = await db.collection("cards").find().toArray();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// Get cards by studentId
app.get("/cards/student/:studentId", async (req, res) => {
  try {
    const cards = await db
      .collection("cards")
      .find({ studentId: req.params.studentId })
      .toArray();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// Get a specific card by CID
app.get("/cards/:cid", async (req, res) => {
  try {
    const card = await db.collection("cards").findOne({ cid: req.params.cid });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// Update a card
app.put("/cards/:cid", async (req, res) => {
  try {
    const {
      monsterName,
      monsterImage,
      cardFrontImage,
      cardBackImage,
      monsterAttribute,
      skill1Attribute,
      skill2Attribute,
      skill1Attack,
      skill2Attack,
    } = req.body;

    const updateData = {};
    if (monsterName) updateData.monsterName = monsterName;
    if (monsterImage) updateData.monsterImage = monsterImage;
    if (cardFrontImage) updateData.cardFrontImage = cardFrontImage;
    if (cardBackImage) updateData.cardBackImage = cardBackImage;
    if (monsterAttribute) updateData.monsterAttribute = monsterAttribute;
    if (skill1Attribute) updateData.skill1Attribute = skill1Attribute;
    if (skill2Attribute) updateData.skill2Attribute = skill2Attribute;
    if (skill1Attack) updateData.skill1Attack = skill1Attack;
    if (skill2Attack) updateData.skill2Attack = skill2Attack;

    const result = await db
      .collection("cards")
      .updateOne({ cid: req.params.cid }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json({ message: "Card updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Delete a card
app.delete("/cards/:cid", async (req, res) => {
  try {
    // First get the card to find the owner
    const card = await db.collection("cards").findOne({ cid: req.params.cid });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Start transaction to ensure data consistency
    const session = db.client.startSession();
    try {
      await session.withTransaction(async () => {
        // Delete the card
        await db
          .collection("cards")
          .deleteOne({ cid: req.params.cid }, { session });

        // Remove the card ID from the student's cardIds array
        await db
          .collection("students")
          .updateOne(
            { studentId: card.studentId },
            { $pull: { cardIds: req.params.cid } },
            { session }
          );
      });
    } finally {
      await session.endSession();
    }

    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
中文名字？
image
接入API



*/
