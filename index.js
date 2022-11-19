const express = require("express");
const app = express();
const cors = require("cors");
const videosRouter = require("./routes/videos");
require("dotenv").config();

const api_key = process.env.API_KEY;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.all("*", checkUser);
app.use("/images", express.static("./public/images"));
app.use("/videos", videosRouter);

app.get("/register", (req, res) => {
  res.json({ api_key });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

function checkUser(req, res, next) {
  if (req.path === "/register") return next();
  if (req.path === "/videos" && req.method === "POST") return next();

  const clientApiKey = req.query.api_key;
  if (clientApiKey === api_key) return next();
  res.send("Api Key is either missing or is invalid. " + clientApiKey);
}

app.listen(process.env.PORT_NUMBER);
