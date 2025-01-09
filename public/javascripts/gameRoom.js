var btn = document.getElementById("startBtn");
var time = document.getElementById("time");
var combo = document.getElementById("combo");
var dog = document.getElementsByClassName("cell");
var sec = 0;
var count = 0;
btn.addEventListener("click", gamestart);
function gamestart() {
  (sec = 60), (count = 0);
  time.textContent = `剩餘時間：${sec}s`;
  combo.textContent = `成績分數：${count}`;

  let timerId = setInterval(function () {
    // 倒數 60 秒
    if (sec === 0) {
      clearInterval(timerId);
      console.log("遊戲結束");
    } else {
      sec--;
      time.textContent = `剩餘時間：${sec}s`;
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

function showit(whichPosition, delay, removeId) {
  if (dog[whichPosition].title != "yellow") {
    let nextPosition = Math.floor(Math.random() * 9);

    showit(nextPosition, delay, removeId);
  } else {
    dog[whichPosition].style.background = "lightblue";
    dog[whichPosition].title = "red";
    dog[whichPosition].alt = removeId;

    setTimeout(function () {
      dog[whichPosition].style.background = "rgb(168, 253, 128)";
      dog[whichPosition].title = "yellow";
      dog[whichPosition].alt = null;
    }, 3000);
  }
}

function getcount(num) {
  combo.textContent = `成績分數：${count}`;
  if (dog[num].title === "red") {
    dog[num].style.background = "rgb(168, 253, 128)";
    dog[num].title = "yellow";
    dog[num].alt = null;
    count++;
  } else if (dog[num].title != "red") {
    dog[num].style.background = "red";
    count = count - 5;
    setTimeout(function () {
      dog[num].style.background = "rgb(168, 253, 128)";
      dog[num].title = "yellow";
      dog[num].alt = null;
    }, 1500);
  }
  // 檢查分數是否小於0
  if (count < 0) {
    alert("得分小於0，遊戲失敗");
    location.reload(); // 重整遊戲頁面
  }
}
