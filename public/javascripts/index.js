// var socket = io();

function newGameRoom() {
  const roomNumber = Date.now();
  window.location.href = "http://localhost:3000/room/" + roomNumber;

  const playerName = document.querySelector('input[type="text"]').value;

  if (!playerName) {
    alert("請輸入玩家姓名");
    window.location.href = "http://localhost:3000/";
    return;
  }
}

function newGameRoomTwo() {
  const playerName = document.querySelector('input[type="text"]').value;

  // 檢查玩家姓名是否輸入
  if (!playerName) {
    alert("請輸入玩家姓名");
    window.location.href = "http://localhost:3000/"; // 返回首頁
    return;
  }

  const roomNumber = Date.now(); // 生成房間號碼

  window.location.href = `http://localhost:3000/room2?roomNumber=${roomNumber}&name=${encodeURIComponent(
    playerName
  )}`;
}
