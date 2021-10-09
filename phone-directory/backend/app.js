const bodyParser = require("body-parser");
const express = require("express");
const routes = require("./routes/directory");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const path = require("path");

//convert port to number if string
const normalizePort = val => {
  var port = parseInt(val);

  if (isNaN(port)) return val;
  if (port >= 0) return port;

  return false;
}

const onListening = () => {
  const port = server.address().port;
  console.log("Listening on " + port);
}

const port = normalizePort(process.env.PORT || "3001");
app.set("port", port);

//create server
const server = http.createServer(app);

server.on("listening", onListening);
server.listen(port);

//mongodb connection
mongoose.connect("mongoconnectionstringgoeshere")
  .then(() => console.log("DB Connected"))
  .catch((err) => {
    console.log(err)
    console.log("DB Connection Failed");
  });

//route all requests with images to backend/images folder
app.use("/images/", express.static(path.join(__dirname, 'images'))); //backend/images for local

//parse incoming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', "***");
  res.setHeader('Content-Type', 'application/json');
  next();
});

//set allowed methods and headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  next();
});

app.use("/directory", routes);
