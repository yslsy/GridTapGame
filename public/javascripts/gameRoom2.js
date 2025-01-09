var btn = document.getElementById("startBtn");
var time = document.getElementById("time");
var combo = document.getElementById("combo");
var dog = document.getElementsByClassName("cell");
var sec = 0;
var count = 0;
var timerId;

// Socket.io 連線
const socket = io();

// 從 URL 中獲取房間號和玩家姓名
const urlParams = new URLSearchParams(window.location.search);
const roomNumber = urlParams.get("roomNumber");
const playerName = urlParams.get("name");

// 連接成功時
socket.on("connect", () => {
  socket.emit("joinRoom", roomNumber, playerName); // 發送請求加入房間
});

// // 監聽房間加入成功
// socket.on("joinSuccess", (room, playerIndex) => {
//   console.log(`Successfully joined room: ${room}`);
//   window.playerIndex = playerIndex; // 保存當前玩家的編號
// });

socket.on("joinSuccess", (roomNumber) => {
  /// 創建自己的分數顯示 div
  createOrUpdateScoreDiv(socket.id, 0);
});

// 處理其他玩家加入事件
socket.on("newPlayerJoined", ({ id, name }) => {
  // 為其他玩家創建分數顯示 div
  createOrUpdateScoreDiv(id, 0); // 初始分數
});

// 處理當前的房間分數
socket.on("currentScores", (scores) => {
  for (const [playerId, score] of Object.entries(scores)) {
    createOrUpdateScoreDiv(playerId, score);
  }
});

// 創建或更新分數顯示 div
function createOrUpdateScoreDiv(playerId, score) {
  let playerScoreDiv = document.getElementById(`score-${playerId}`);

  // 如果 div 不存在，則創建一個新的
  if (!playerScoreDiv) {
    playerScoreDiv = document.createElement("div");
    playerScoreDiv.id = `score-${playerId}`;
    playerScoreDiv.className = "player-score";
    document.getElementById("score-container").appendChild(playerScoreDiv);
  }

  // 更新分數顯示
  playerScoreDiv.textContent = `成績分數：${score}`;
}

// 監聽房間加入失敗
socket.on("joinFailed", (message) => {
  alert(message);
  window.location.href = "/"; // 返回首頁
});

// 點擊開始遊戲按鈕
btn.addEventListener("click", gamestart);

function gamestart() {
  sec = 60;
  time.textContent = `剩餘時間：${sec}s`;

  // 通知服務器遊戲開始
  socket.emit("startGame", roomNumber);

  // 清空分數
  clearScores();

  // 開始計時
  timerId = setInterval(function () {
    if (sec === 0) {
      clearInterval(timerId);
      socket.emit("endGame", roomNumber); // 通知遊戲結束
      console.log("遊戲結束");
    } else {
      sec--;
      time.textContent = `剩餘時間：${sec}s`;
      socket.emit("updateTime", sec, roomNumber); // 同步剩餘時間
    }
  }, 1000);

  for (let i = 0; i < 100; i++) {
    let whichPosition = Math.floor(Math.random() * 9);
    let ontime = Math.floor(Math.random() * 57000);
    let delay = Math.floor(Math.random() * 3) + 2;

    setTimeout(function () {
      showit(whichPosition, delay, i);
    }, ontime);
  }
}

// 清空分數
function clearScores() {
  // 清空儲存分數的對象
  for (const playerId in playerScores) {
    playerScores[playerId] = 0; // 重置每個玩家的分數為0
    createOrUpdateScoreDiv(playerId, 0); // 更新顯示為0
  }
}

// 顯示狗狗位置的函數
function showit(whichPosition, delay, removeId) {
  if (dog[whichPosition].title !== "yellow") {
    let nextPosition = Math.floor(Math.random() * 9);
    showit(nextPosition, delay, removeId);
  } else {
    dog[whichPosition].style.background = "lightblue";
    dog[whichPosition].title = "red";
    dog[whichPosition].alt = removeId;

    // 發出事件通知其他玩家
    socket.emit("dogShown", whichPosition, removeId);

    setTimeout(function () {
      dog[whichPosition].style.background = "rgb(168, 253, 128)";
      dog[whichPosition].title = "yellow";
      dog[whichPosition].alt = null;
    }, 3000);
  }
}

const playerScores = {}; // 儲存每個玩家的分數

// 更新得分的函数
function getcount(num) {
  if (dog[num].title === "red") {
    dog[num].style.background = "rgb(168, 253, 128)";
    dog[num].title = "yellow";
    dog[num].alt = null;
    count++;

    // 更新分数
    playerScores[socket.id] = count; // 儲存該玩家分數
    console.log(`Player ${socket.id} scored. Current score: ${count}`); // 輸出該玩家當前得分

    socket.emit("updateScore", { [socket.id]: count }); // 通知服務器更新分數
    socket.emit("dogClicked", num); // 發送事件，通知其他玩家該方格已被點擊
  }
}

// 監聽其他玩家的得分更新
socket.on("scoreUpdated", (scores) => {
  for (const [playerId, score] of Object.entries(scores)) {
    createOrUpdateScoreDiv(playerId, score);
  }
});
// 監聽自己得分更新
socket.on("selfScoreUpdated", (newScore) => {
  createOrUpdateScoreDiv(socket.id, newScore);
});

// 監聽其他玩家的時間更新
socket.on("timeUpdated", (remainingTime) => {
  time.textContent = `剩餘時間：${remainingTime}s`;
});

socket.on("gameEnded", () => {
  clearInterval(timerId); // 停止計時
  // 顯示遊戲結束
});

// 監聽其他玩家的狗狗顯示事件
socket.on("dogShown", (whichPosition, removeId) => {
  dog[whichPosition].style.background = "lightblue";
  dog[whichPosition].title = "red";
  dog[whichPosition].alt = removeId;

  setTimeout(function () {
    dog[whichPosition].style.background = "rgb(168, 253, 128)";
    dog[whichPosition].title = "yellow";
    dog[whichPosition].alt = null;
  }, 3000);
});

// 狗狗得分事件
socket.on("dogClicked", (num) => {
  dog[num].style.background = "rgb(168, 253, 128)";
  dog[num].title = "yellow";
  dog[num].alt = null;
});
