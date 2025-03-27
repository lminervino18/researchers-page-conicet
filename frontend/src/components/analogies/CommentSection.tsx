import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTrash, faReply } from '@fortawesome/free-solid-svg-icons';
import { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { deleteComment } from '../../api/Comment';
import { getColorForName, getInitials } from '../../utils/ColorUtils';
import './styles/CommentSection.css';

interface CommentSectionProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  analogyId: number;
  onSubmitComment: (content: string, parentId?: number) => Promise<void>;
  onLoadMoreComments: () => void;
  onDeleteComment?: (commentId: number) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  loading,
  hasMore,
  analogyId,
  onSubmitComment,
  onLoadMoreComments,
  onDeleteComment
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_COMMENT_LENGTH = 250;

  useEffect(() => {
    console.log('Comments received:', comments);
  }, [comments]);

  const handleDeleteComment = async (commentId: number) => {
    try {
      if (onDeleteComment) {
        await onDeleteComment(commentId);
      } else {
        await deleteComment(analogyId, commentId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const findChildComments = (parentId: number | null): Comment[] => {
    return comments.filter(comment => 
      parentId === null 
        ? comment.parentId === undefined || comment.parentId === null
        : comment.parentId === parentId
    );
  };

  const renderCommentTree = (parentId: number | null = null, depth: number = 0) => {
    const childComments = findChildComments(parentId);

    return childComments.map(comment => (
      <div 
        key={comment.id} 
        className={`comment depth-${depth}`}
        style={{ 
          marginLeft: depth > 0 ? `${depth * 20}px` : '0',
          borderLeft: depth > 0 ? '2px solid var(--border-color)' : 'none'
        }}
      >
        <div className="comment-content">
          <div 
            className="user-avatar" 
            style={{ 
              backgroundColor: getColorForName(comment.userName),
              color: 'white'
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
              {user?.email === comment.email && (
                <button 
                  className="delete-comment-btn"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
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

        {replyingTo === comment.id && (
          <div className="reply-input">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setNewComment(e.target.value);
                }
              }}
              placeholder="Write a reply..."
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="comment-input-footer">
              <span className="char-count">
                {newComment.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button
                onClick={() => {
                  onSubmitComment(newComment, comment.id);
                  setNewComment('');
                  setReplyingTo(null);
                }}
                disabled={!newComment.trim()}
              >
                <FontAwesomeIcon icon={faComment} /> Submit
              </button>
            </div>
          </div>
        )}

        {renderCommentTree(comment.id, depth + 1)}
      </div>
    ));
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    await onSubmitComment(newComment);
    setNewComment('');
  };

  return (
    <div className="comments-section">
      <h2>Comments</h2>
      <div className="comment-input">
        <textarea
          value={newComment}
          onChange={(e) => {
            if (e.target.value.length <= MAX_COMMENT_LENGTH) {
              setNewComment(e.target.value);
            }
          }}
          placeholder="Write a comment..."
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="comment-input-footer">
          <span className="char-count">
            {newComment.length}/{MAX_COMMENT_LENGTH}
          </span>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <FontAwesomeIcon icon={faComment} /> Submit
          </button>
        </div>
      </div>

      <div className="comments-list">
        {loading && comments.length === 0 ? (
          <div>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div>No comments yet</div>
        ) : (
          renderCommentTree()
        )}
      </div>

      {hasMore && (
        <button
          className="load-more-comments"
          onClick={onLoadMoreComments}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More Comments'}
        </button>
      )}
    </div>
  );
};

export default CommentSection;