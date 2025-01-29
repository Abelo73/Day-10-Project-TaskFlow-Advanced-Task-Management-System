const Comment = require("../models/Comment");

// Like a comment

exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.user._id;

    // Find Comment

    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({
        message: "Comment not found",
        status: false,
      });

    //   Check if user has already liked the comment
    if (comment.likes.includes(userId)) {
      return res.status(400).json({
        message: "You have already liked this comment",
        status: false,
      });
    }
    //   Add user to likes array
    comment.likes.push(userId);
    comment.totalLikes = comment.likes.length;

    await comment.save();
    res.status(200).json({
      message: "Comment liked successfully",
      status: true,
      totalLikes: comment.totalLikes,
    });
  } catch (error) {
    res.status({
      message: "Error liking comment",
      status: false,
    });
  }
};

exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming `req.user` is the authenticated user

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if the user has liked the comment
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have not liked this comment yet",
      });
    }

    // Remove user from the likes array
    comment.likes = comment.likes.filter(
      (like) => like.toString() !== userId.toString()
    );
    comment.totalLikes = comment.likes.length; // Update total likes

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
      totalLikes: comment.totalLikes,
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json({
      success: false,
      message: "Error unliking comment",
    });
  }
};

// Get comments for a specific task with like information
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ taskId, status: "active" })
      .populate("userId", "username") // Populate user info (e.g., username)
      .populate({
        path: "likes", // Populate likes with user info
        select: "username", // Only return the username of users who liked
      })
      .sort({ createdAt: -1 }); // Sorting comments by creation date

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No comments found for this task",
      });
    }

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};
