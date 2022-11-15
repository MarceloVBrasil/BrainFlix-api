const app = require("express")();
const cors = require("cors");
const { v4: uuidV4 } = require("uuid");
const api_key = uuidV4();

app.use(
  cors({
    origin: "*",
  })
);

const videos = require("./data/video-details.json");

app.get("/register", (req, res) => {
  res.json({ api_key });
});

app.get("/videos", (req, res) => {
  const key = req.query.api_key;
  if (api_key !== key) return res.status(400).send("Bad Request");
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

app.get("/videos/:videoId", (req, res) => {
  const key = req.query.api_key;
  if (api_key !== key) return res.status(400).send("Bad Request");
  const videoId = req.params.videoId;
  const video = videos.find((video) => video.id === videoId);
  if (!video)
    return res.status(404).json({ message: "No video with that id exists" });
  res.json(video);
});

app.listen(8080, () => console.log("listening on port 8080"));
