const express = require("express");
const router = express.Router();

// Home Page
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// 單人模式: 生成隨機房間號碼時渲染頁面
router.get("/room/:roomNumber", (req, res) => {
  const roomNumber = req.params.roomNumber;
  res.render("gameRoom", { roomNumber });
});

// 雙人模式: 生成隨機房間號碼時渲染頁面
router.get("/room2", (req, res) => {
  const roomNumber = req.query.roomNumber;
  res.render("gameRoom2", { roomNumber });
});

module.exports = router;
