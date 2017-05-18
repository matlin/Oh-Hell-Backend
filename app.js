const express = require("express");
const path = require("path");
var http = require('http');
var debug = require('debug')('ohell:server');
// const favicon = require('serve-favicon');
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const index = require("./routes/index");
const users = require("./routes/users");
const game = require("./routes/game");


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
const whitelist = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000",
  "http://localhost:80"
];
const corsOptions = {
  methods: ["GET", "PUT", "POST", "DELETE"],
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || true) { //this allows all origins
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler

var server = http.createServer(app);
var port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

const io = require('socket.io')(server);

io.on('connection', (socket) => {
 console.log('User connected');
 socket.on('join', (id) => {
   console.log('user joined' , id);
   socket.join(id);
 });
});

app.use('/game', function(req,res,next){
    console.log('attaching socket to request');
    req.io = io;
    next();
});

app.use("/", index);
app.use("/users", users);
app.use("/game", game);

app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status = err.status || 500;
  res.render("error");
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log('listening on port ' + port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


module.exports = app;
