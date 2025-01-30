const Comment = require("../models/Comment");

// Like a comment

exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        status: false,
      });
    }

    if (comment.likes.includes(userId.toString())) {
      return res.status(400).json({
        message: "You have already liked this comment",
        status: false,
      });
    }

    comment.likes.push(userId);
    comment.totalLikes = comment.likes.length;

    await comment.save();
    res.status(200).json({
      message: "Comment liked successfully",
      status: true,
      totalLikes: comment.totalLikes,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({
      message: "Error liking comment",
      status: false,
    });
  }
};

exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    console.log("User ID:", userId);

    const comment = await Comment.findById(commentId);
    console.log("Comment found:", comment);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (!comment.likes || !Array.isArray(comment.likes)) {
      comment.likes = [];
    }

    comment.likes = comment.likes.filter((like) => like);

    const likesAsStrings = comment.likes.map((id) => id?.toString());

    if (!likesAsStrings.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have not liked this comment yet",
      });
    }

    // Remove the user from the likes array
    comment.likes = comment.likes.filter((like) => like?.toString() !== userId);
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

// Add new comment or replay

// exports.addComment = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { content, parentCommentId } = req.body;

//     if (!content) {
//       return res.status(400).json({
//         status: false,
//         message: "Content required.",
//       });
//     }

//     const newComment = new Comment({
//       content,
//       userId: req.user._id,
//       taskId,
//       parentCommentId: parentCommentId || null,
//     });
//     await newComment.save();
//     res.status(200).json({
//       status: true,
//       message: "Comment added successfully",
//       comment: newComment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: `Error adding comment: ${error.message}`,
//     });
//   }
// };

exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({
        status: false,
        message: "Content required.",
      });
    }

    const newComment = new Comment({
      content,
      userId: req.user._id,
      taskId,
      parentCommentId: parentCommentId || null,
    });

    await newComment.save();

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          status: false,
          message: "Parent comment not found.",
        });
      }

      parentComment.replies.push(newComment._id);
      await parentComment.save();
    }

    res.status(200).json({
      status: true,
      message: parentCommentId
        ? "Reply added successfully"
        : "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Error adding comment: ${error.message}`,
    });
  }
};

// Delete a comment or reply
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if the user is the creator or an admin (if needed)
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // Soft delete the comment by setting its status to 'deleted'
    comment.status = 'deleted';
    await comment.save();

    // Also delete all replies (if any) for this comment
    await Comment.updateMany(
      { parentCommentId: commentId },
      { status: 'deleted' }
    );

    res.status(200).json({
      success: true,
      message: "Comment and its replies deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};

// Update a comment or reply
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if the user is the creator or an admin (if needed)
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
      });
    }

    // Update the content
    comment.content = content;
    comment.updatedAt = Date.now(); // Update the timestamp

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating comment",
    });
  }
};


// Update a reply
exports.updateReply = async (req, res) => {
  try {
    const { commentId } = req.params; // Comment ID (reply ID in this case)
    const { content } = req.body;
    const userId = req.user._id;

    // Find the reply (which is a comment with a parentCommentId)
    const reply = await Comment.findById(commentId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Ensure that the reply is associated with a parent comment
    if (!reply.parentCommentId) {
      return res.status(400).json({
        success: false,
        message: "This is not a valid reply",
      });
    }

    // Check if the user is the creator of the reply
    if (reply.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this reply",
      });
    }

    // Update the content of the reply
    reply.content = content;
    reply.updatedAt = Date.now(); // Update timestamp

    await reply.save();

    res.status(200).json({
      success: true,
      message: "Reply updated successfully",
      reply,
    });
  } catch (error) {
    console.error("Error updating reply:", error);
    res.status(500).json({
      success: false,
      message: "Error updating reply",
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { commentId } = req.params; // Comment ID (reply ID in this case)
    const userId = req.user._id;

    // Find the reply (which is a comment with a parentCommentId)
    const reply = await Comment.findById(commentId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Ensure that the reply is associated with a parent comment
    if (!reply.parentCommentId) {
      return res.status(400).json({
        success: false,
        message: "This is not a valid reply",
      });
    }

    // Check if the user is the creator of the reply
    if (reply.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this reply",
      });
    }

    // Soft delete the reply by setting its status to 'deleted'
    reply.status = 'deleted';
    await reply.save();

    // Remove the reply from the parent comment's replies array
    const parentComment = await Comment.findById(reply.parentCommentId);
    if (parentComment) {
      parentComment.replies = parentComment.replies.filter(
        (replyId) => replyId.toString() !== commentId
      );
      await parentComment.save();
    }

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting reply",
    });
  }
};





exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log("Request params:", req.params);

    const comments = await Comment.find({
      taskId,
      parentCommentId: null,
      status: "active",
    })
      .populate("userId", "username")
      .populate({
        path: "likes",
        select: "username",
      })
      .populate({
        path: "replies",
        populate: {
          path: "userId",
          select: "username",
        },
      })
      .sort({ createdAt: -1 });

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No comments found for task with id ${taskId}`,
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
