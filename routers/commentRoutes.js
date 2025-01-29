const express = require("express");
const router = express.Router();
const {
  likeComment,
  unlikeComment,
  getCommentsByTask,
} = require("../controllers/commentController");
const authenticateUser = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authenticateUser,
  checkPermission(["GET_COMMENTS"]),
  getCommentsByTask
);

router.post("/:commentId/like", authenticateUser, likeComment);
router.post("/:commentId/unlike", authenticateUser, unlikeComment);
router.get("/task/:taskId", authenticateUser, getCommentsByTask);
module.exports = router;
