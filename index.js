const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const server = require("http").Server(app);

// 創建 socket 服務
const io = require("socket.io")(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

let rooms = {}; // 儲存房間

// 當發生連線事件
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomNumber, playerName) => {
    // 檢查房間是否存在，如果不存在則創建
    if (!rooms[roomNumber]) {
      rooms[roomNumber] = { players: [], scores: {} };
    }

    // 檢查當前房間的玩家數量
    if (rooms[roomNumber].players.length < 2) {
      const playerIndex = rooms[roomNumber].players.length + 1;
      rooms[roomNumber].players.push({ id: socket.id, name: playerName });
      socket.join(roomNumber); // 將用戶加入房間
      socket.roomNumber = roomNumber; // 將房間號儲存到 socket

      // 初始化得分
      if (!rooms[roomNumber].scores) {
        rooms[roomNumber].scores = {}; // 確保 scores 對象存在
      }
      rooms[roomNumber].scores[socket.id] = 0; // 初始化得分為0
      // 廣播新玩家加入事件
      socket
        .to(roomNumber)
        .emit("newPlayerJoined", { id: socket.id, name: playerName });

      // 發送當前房間內的所有玩家分數給新加入的玩家
      socket.emit("currentScores", rooms[roomNumber].scores);
      socket.emit("joinSuccess", roomNumber); // 通知用戶成功加入房間
    } else {
      socket.emit("joinFailed", "房間人數已滿，將返回首頁");
      socket.disconnect(); // 斷開連接
    }
  });

  socket.on("startGame", (roomNumber) => {
    // 廣播遊戲開始事件給同一房間的所有玩家
    socket.to(roomNumber).emit("gameStarted");
  });

  socket.on("updateTime", (remainingTime, roomNumber) => {
    socket.to(roomNumber).emit("timeUpdated", remainingTime);
  });

  // socket.on("updateScore", (newScore, roomNumber) => {
  //   socket.to(roomNumber).emit("scoreUpdated", newScore);
  // });

  socket.on("updateScore", (newScores) => {
    if (rooms[socket.roomNumber]) {
      // 更新房間內所有玩家的分數
      rooms[socket.roomNumber].scores[socket.id] = newScores[socket.id]; // 更新該玩家的得分

      // 廣播給其他玩家
      socket
        .to(socket.roomNumber)
        .emit("scoreUpdated", rooms[socket.roomNumber].scores); // 廣播更新

      // 發送自己的分數
      socket.emit("selfScoreUpdated", newScores[socket.id]);
    }
  });

  socket.on("dogShown", (whichPosition, removeId) => {
    const roomNumber = socket.roomNumber; // 得到當前房間號碼
    socket.to(roomNumber).emit("dogShown", whichPosition, removeId);
  });

  socket.on("dogClicked", (num) => {
    const roomNumber = socket.roomNumber; // 得到當前房間號碼
    socket.to(roomNumber).emit("dogClicked", num); // 廣播給同一房間的所有玩家
  });

  socket.on("endGame", (roomNumber) => {
    socket.to(roomNumber).emit("gameEnded"); // 廣播遊戲結束事件
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // 查找並從房間中移除玩家
    for (const room in rooms) {
      const playerIndex = rooms[room].players.findIndex(
        (player) => player.id === socket.id
      );

      if (playerIndex !== -1) {
        console.log(
          `玩家 ${rooms[room].players[playerIndex].name} 從房間 ${room} 退出`
        );
        rooms[room].players.splice(playerIndex, 1); // 從房間中移除玩家

        // 如果房間空了，可以選擇刪除房間
        if (rooms[room].players.length === 0) {
          delete rooms[room];
        }
        break;
      }
    }
  });
});

const indexRouter = require("./routes/index");

app.use("/", indexRouter);

server.listen(3000, () => {
  console.log("Server Started. http://localhost:3000");
});
