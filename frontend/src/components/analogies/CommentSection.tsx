import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faTrash, faReply } from "@fortawesome/free-solid-svg-icons";
import { Comment } from "../../types";
import { deleteComment } from "../../api/Comment";
import { getColorForName, getInitials } from "../../utils/ColorUtils";
import ConfirmationModal from "./ConfirmationModal";
import "./styles/CommentSection.css";

interface User {
  email: string;
  username: string;
  // Additional user fields can be added here
}

interface CommentSectionProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  onSubmitComment: (content: string, parentId?: number) => Promise<void>;
  onLoadMoreComments: () => void;
  onDeleteComment?: (commentId: number) => Promise<void>;
  user?: User | null; // Current logged-in user, or null if not logged in
  onRequestLogin?: () => void; // Callback to trigger login modal/prompt
}

const CommentSection: React.FC<CommentSectionProps> = React.memo(({
  comments,
  loading,
  hasMore,
  onSubmitComment,
  onLoadMoreComments,
  onDeleteComment,
  user,
  onRequestLogin,
}) => {
  // State for main comment input
  const [mainComment, setMainComment] = useState("");
  // State for reply comment input
  const [replyComment, setReplyComment] = useState("");
  // Which comment id is currently being replied to (if any)
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  // Modal state for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Stores the comment id pending deletion
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // Ref to the comments list container (if needed for scrolling)
  const commentsListRef = useRef<HTMLDivElement | null>(null);
  
  const MAX_COMMENT_LENGTH = 250; // Max allowed length for comment text

  // Handles deleting a comment either via prop callback or direct API call
  const handleDeleteComment = async (commentId: number) => {
    try {
      if (onDeleteComment) {
        await onDeleteComment(commentId);
      } else {
        await deleteComment(commentId);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Confirm deletion after user accepts confirmation modal
  const confirmDeleteComment = async () => {
    if (commentToDelete !== null) {
      await handleDeleteComment(commentToDelete);
      setIsModalOpen(false);
      setCommentToDelete(null);
    }
  };

  // Handler to load more comments on button click
  const handleLoadMoreComments = () => {
    onLoadMoreComments();
  };

  // Convert comments array to a Map for easy access by ID
  const commentMap = new Map<number, Comment>();
  comments.forEach((c) => commentMap.set(c.id, c));

  /**
   * Recursively renders comments as a threaded tree structure.
   * Each reply is indented and styled.
   * @param commentMap Map of comment IDs to comment objects
   * @param parentId The ID of the parent comment, or null for root-level comments
   * @param depth The current depth level of nesting (for indentation)
   */
  const renderCommentTree = (
    commentMap: Map<number, Comment>,
    parentId: number | null = null,
    depth: number = 0
  ) => {
    // Get comments for the current parentId (root if null)
    const commentsToRender =
      parentId === null
        ? Array.from(commentMap.values()).filter(c => !c.parentId)
        : commentMap.get(parentId)?.replies || [];

    return commentsToRender.map((comment) => (
      <div
        key={comment.id}
        className={`comment depth-${depth}`}
        style={{
          marginLeft: depth > 0 ? `${depth * 20}px` : "0",
          borderLeft: depth > 0 ? "2px solid var(--border-color)" : "none",
        }}
      >
        <div className="comment-content">
          <div
            className="user-avatar"
            style={{
              backgroundColor: getColorForName(comment.userName),
              color: "white",
            }}
          >
            {getInitials(comment.userName)}
          </div>

          <div className="comment-body">
            <p>{comment.content}</p>
            <div className="comment-metadata">
              <span className="comment-author">{comment.userName}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>

              {/* Show delete button only if current user is author */}
              {user?.email === comment.email && (
                <button
                  className="delete-comment-btn"
                  onClick={() => {
                    setCommentToDelete(comment.id);
                    setIsModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}

              {/* Show reply button only if nesting depth < 3 */}
              {depth < 3 && (
                <button
                  className="reply-btn"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <FontAwesomeIcon icon={faReply} /> Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply input shown only when replying to this comment */}
        {replyingTo === comment.id && (
          <div className="reply-input">
            <textarea
              value={replyComment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setReplyComment(e.target.value);
                }
              }}
              placeholder={user ? "Write a reply..." : "Please log in to comment"}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={!user} // Disable if not logged in
            />
            <div className="comment-input-footer">
              <span className="char-count">
                {replyComment.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button
                onClick={async () => {
                  if (!user) {
                    // If not logged in, trigger login modal via callback
                    if (onRequestLogin) onRequestLogin();
                    return;
                  }

                  await onSubmitComment(replyComment, comment.id);
                  setReplyComment("");
                  setReplyingTo(null);
                }}
                disabled={!replyComment.trim()}
              >
                <FontAwesomeIcon icon={faComment} /> Submit
              </button>
            </div>
          </div>
        )}

        {/* Recursively render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="nested-comments">
            {renderCommentTree(commentMap, comment.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Handles main comment submission, requesting login if necessary
  const handleSubmitMainComment = async () => {
    if (!user) {
      if (onRequestLogin) onRequestLogin();
      return;
    }

    if (!mainComment.trim()) return;

    await onSubmitComment(mainComment);
    setMainComment("");
  };

  return (
    <div className="comments-section">
      <h2>Comments</h2>

      <div className="comment-input">
        <textarea
          value={mainComment}
          onChange={(e) => {
            if (e.target.value.length <= MAX_COMMENT_LENGTH) {
              setMainComment(e.target.value);
            }
          }}
          placeholder={user ? "Write a comment..." : "Please log in to comment"}
          disabled={!user} // Disable textarea if not logged in
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="comment-input-footer">
          <span className="char-count">
            {mainComment.length}/{MAX_COMMENT_LENGTH}
          </span>
          <button
            onClick={handleSubmitMainComment}
            disabled={!mainComment.trim() || !user} // Disable button if no text or not logged in
          >
            <FontAwesomeIcon icon={faComment} /> Submit
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="comments-list" ref={commentsListRef}>
        {loading && comments.length === 0 ? (
          <div>Loading comments...</div>
        ) : (
          <>
            {comments.length === 0 ? (
              <div>No comments yet</div>
            ) : (
              renderCommentTree(commentMap)
            )}
          </>
        )}
      </div>

      {/* Show Load More Comments button only if there are comments and hasMore is true */}
      {comments.length > 0 && hasMore && (
        <button
          className="load-more-comments"
          onClick={handleLoadMoreComments}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More Comments"}
        </button>
      )}

      {/* Confirmation modal for deleting comments */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteComment}
        message="Are you sure you want to delete this comment?"
      />
    </div>
  );
});

export default CommentSection;
