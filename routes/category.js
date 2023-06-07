const { postitem } = require("../models/category");
const messageschema = require("../models/messages");
require("dotenv").config({ path: "../../.env" });
const { requireSignin, userMiddleware } = require("../middleware");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const SignUp = require("../models/signup");
const mongoose = require("mongoose");

// const bucket=process.env.AWS_BUCKET_NAME;
// const region=process.env.AWS_BUCKET_REGION;
// const accesskey=process.envAWS_ACCESS_KEY;
// const secretkey=process.env.AWS_SECRET_KEY;
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/postitem",
  requireSignin,
  userMiddleware,
  upload.array("itemPictures"),
  async (req, res) => {
    console.log("Hitted the POST successfully ");
    try {
      console.log("try");
      const { name, description, question, type } = req.body;
      console.log(req.files);

      const itemPictures = req.files.map((file) => ({
        img: file.buffer,
        key: `${uuidv4()}-${file.originalname}-${Date.now()}`,
        mimetype: file.mimetype,
      }));
      console.log("executed itempictures")

      const uploadPromises = itemPictures.map((itemPicture) => {
        const command = new PutObjectCommand({
          Bucket: "airportitemtracker",
          Key: itemPicture.key,
          Body: itemPicture.img,
          // ContentType: file.mimetype,
          ContentType: itemPicture.img.mimetype,
        });
        return s3Client.send(command);
      });
      console.log("uploadPromises")

      await Promise.all(uploadPromises);
      const newItem = {
        name: name,
        description: description,
        question: question,
        type: type,
        createdBy: req.user._id,
        itemPictures: itemPictures.map((item) => ({ img: item.key })),
      };

      const newPost = await postitem.create(newItem);
      console.log("newPost")
      
      if (newPost) {
        res.status(201).json({ item: newPost });
      } else {
        res.status(400).json({ error: "Failed to create post" });
      }
      
    } catch (err) {
      console.log("Error:",err);
      res.status(401).json({
        "Message is": err.message,
      });
    }
  }
);
router.get("/getitem", async (req, res) => {
  try {
    const postitems = await postitem.find({}).exec();
    res.status(200).json({
      postitems,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
});


router.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await postitem.find({ _id: id }).exec();

    const answers = await messageschema.find({ itemId: item[0]._id }).exec();

    res.status(200).json({
      Item: item,
      Answers: answers,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});


router.post("/edititem", upload.array("itemPictures"), async (req, res) => {
  const { id, name, description, question, type, createdBy, olditemPictures } = req.body;
  console.log(req.files);
  console.log(olditemPictures);

  var itemPictures = [];
  if (req.files.length > 0) {
    itemPictures = req.files.map((file) => {
      return { img: file.filename };
    });
  }

  let item = {
    name: name,
    description: description,
    type: type,
    question: question,
    createdBy: createdBy
  };

  if (Array.isArray(olditemPictures)) { // Check if olditemPictures is an array
    console.log("Old one");
    let itemPictures = olditemPictures.map((pic) => {
      return { img: pic };
    });
    item.itemPictures = itemPictures;
  } else {
    console.log("New one ", itemPictures);
    item.itemPictures = itemPictures;
  }

  const updateItem = await postitem.findOneAndUpdate({ _id: id }, item, {
    new: true,
  });

  res.status(200).json({
    updateItem,
  });
});



router.post("/deleteitem", async (req, res) => {
  const { item_id } = req.body;
  console.log("Item id is :", item_id);
  const deleteitem = await postitem.findOneAndDelete({ _id: item_id });
  const deletemsgs = await messageschema.deleteMany({ itemId: item_id });

  res.status(200).json({
    body: req.body,
  });
});




router.get("/getnumber/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id is:", id);
    const user = await SignUp.findById(id).exec();

    if (user && user.number) {
      res.status(200).json({
        Number: user.number,
      });
    } else {
      res.status(404).json({
        error: "User not found or number is missing",
      });
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(400).json({
      error: err.message,
    });
  }
});




router.get("/getquestion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await postitem.find({ _id: id }).exec();

    if (!item || item.length === 0) {
      return res.status(404).json({ Error: "Item not found" });
    }

    const createdBy = item[0].createdBy;
    const user = await SignUp.find({ _id: createdBy }).exec();

    if (!user || user.length === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    res.status(200).json({
      Question: user[0].number,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});


router.post("/submitAnswer", async (req, res) => {
  console.log(req.body);
  const { itemId, question, answer, givenBy, belongsTo } = req.body;

  try {
    const newmessage = await messageschema.create({
      itemId: itemId,
      belongsTo: belongsTo,
      question: question,
      answer: answer,
      givenBy: givenBy,
    });
    res.status(201).json({ item: newmessage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/myresponses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Used Id is :", id);
    const items = await messageschema.find({ givenBy: id }).exec();

    console.log(items);
    res.status(200).json({
      item: items,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});


router.get("/mylistings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Used Id is :", id);
    const items = await postitem.find({ createdBy: id }).exec();

    res.status(200).json({
      item: items,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});


router.post("/confirmResponse/:id", async (req, res) => {
  const { id } = req.params;
  const { response } = req.body; // Extract the 'response' property from the request body

  console.log("Used Id is:", id);
  console.log("Request body:", req.body);

  try {
    console.log("Before update");
    const updatedMessage = await messageschema.updateOne(
      { _id: id },
      { $set: { response: response } },
      { upsert: false }
    );

    console.log("Inside callback");
    console.log("Updated message:", updatedMessage);

    res.status(200).json({ msg: "Message updated successfully" });
  } catch (err) {
    console.log("Error updating message:", err);
    res.status(400).json({ msg: "Failed to update message" });
  }
});




module.exports = router;