const express = require("express")
const scoresRouter = require("./routes/scores")
const cors = require("cors")
const app = express()

const server = require("http").Server(app)
const io = require("socket.io")(server)

app.use(express.json())
app.use(cors())
app.use("/api/scores", scoresRouter)

//Serve Static Assets in production
//set static folder
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/../public/"))

  app.get("*", (req, res) => {
    res.sendFile(__dirname + "/../public/index.html")
  })
}

module.exports = { app, server, io }
