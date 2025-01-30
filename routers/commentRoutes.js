const express = require("express");
const router = express.Router();
const {
  likeComment,
  unlikeComment,
  getCommentsByTask,
  addComment,
  deleteComment,
  updateComment,
  deleteReply,
  updateReply,
} = require("../controllers/commentController");
const authenticateUser = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/roleMiddleware");

router.get(
  "/:taskId",
  authenticateUser,
  // checkPermission(["GET_COMMENTS"]),
  getCommentsByTask
);

router.post("/:commentId/like", authenticateUser, likeComment);
router.post("/:commentId/unlike", authenticateUser, unlikeComment);
router.get("/task/:taskId", authenticateUser, getCommentsByTask);
router.post("/:taskId", authenticateUser, addComment);
router.delete("/:commentId", authenticateUser, deleteComment);
router.put("/:commentId", authenticateUser, updateComment);
router.delete("/reply/:commentId", authenticateUser, deleteReply);
router.put("/reply/:commentId", authenticateUser, updateReply);
module.exports = router;
