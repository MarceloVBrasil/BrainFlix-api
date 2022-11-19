const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidV4 } = require("uuid");
require("dotenv").config();
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: (_req, file, cb) => {
    const fileExtension = getFileExtension(path.extname(file.originalname));
    const acceptedFormats = ["jpg", "jpeg", "png"];

    if (acceptedFormats.includes(fileExtension))
      cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

let videos = JSON.parse(fs.readFileSync("./data/video-details.json"));

router.get("/", (req, res) => {
  res.json(
    videos.map((video) => {
      return {
        id: video.id,
        title: video.title,
        channel: video.channel,
        image: video.image,
      };
    })
  );
});

router.get("/:videoId", (req, res) => {
  const { videoId } = req.params;
  const video = videos.find((video) => video.id === videoId);
  if (!video)
    return res.status(404).json({ message: "No video with that id exists" });
  res.status(200).json(video);
});

router.post("/:videoId/comments", (req, res) => {
  const { videoId } = req.params;
  const videoIndex = videos.findIndex((video) => video.id === videoId);
  if (videoIndex === -1)
    return res.status(404).json({ message: "No video with that id exists" });

  const newComment = {
    name: req.body.name,
    comment: req.body.comment,
    id: uuidV4(),
    likes: 0,
    timestamp: Date.now(),
  };

  videos[videoIndex].comments.unshift(newComment);
  fs.writeFileSync("./data/video-details.json", JSON.stringify(videos));
  videos = JSON.parse(fs.readFileSync("./data/video-details.json"));
  res.status(201).json(newComment);
});

router.post("/", upload.single("thumbnail"), (req, res) => {
  const { title, description } = req.body;
  const imageName = req.file ? req.file.filename : "Upload-video-preview.jpg";

  if (!title || !description)
    return res.status(400).json({ message: "Missing title and description" });
  const newVideo = {
    id: uuidV4(),
    title,
    channel: "Biking  World",
    image: `http://localhost:${process.env.PORT_NUMBER}/images/${imageName}?api_key=${process.env.API_KEY}`,
    description,
    views: "0",
    likes: "0",
    duration: "5:00",
    video: "",
    timestamp: Date.now(),
    comments: [],
  };

  videos.push(newVideo);
  fs.writeFileSync("./data/video-details.json", JSON.stringify(videos));
  res.status(201).json(newVideo);
});

router.delete("/:videoId/comments/:commentId", (req, res) => {
  const { videoId, commentId } = req.params;
  const videoIndex = videos.findIndex((video) => video.id === videoId);
  const commentIndex = videos[videoIndex].comments.findIndex(
    (comment) => comment.id === commentId
  );
  const deletedComment = videos[videoIndex].comments[commentIndex];
  const newComments = videos[videoIndex].comments.filter(
    (comment) => comment.id !== commentId
  );
  videos[videoIndex].comments = newComments;

  fs.writeFileSync("./data/video-details.json", JSON.stringify(videos));
  res.status(200).json({ ...deletedComment });
});

router.put("/:videoId/comments/:commentId", (req, res) => {
  const { videoId, commentId } = req.params;
  const { initialNumberOfLikes } = req.body;
  const videoIndex = videos.findIndex((video) => video.id === videoId);
  const commentIndex = videos[videoIndex].comments.findIndex(
    (comment) => comment.id === commentId
  );
  if (videos[videoIndex].comments[commentIndex].likes > initialNumberOfLikes)
    videos[videoIndex].comments[commentIndex].likes--;
  else videos[videoIndex].comments[commentIndex].likes++;

  fs.writeFileSync("./data/video-details.json", JSON.stringify(videos));
  res.status(200).json({ ...videos[videoIndex].comments[commentIndex] });
});

function getFileExtension(filename) {
  if (!filename) return "";
  return filename.substring(filename.lastIndexOf(".") + 1);
}

module.exports = router;
