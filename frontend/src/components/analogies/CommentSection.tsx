import React, { useState } from 'react';
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
  const [mainComment, setMainComment] = useState('');
  const [replyComment, setReplyComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const MAX_COMMENT_LENGTH = 250;
  /**
   * Builds a hierarchical comment structure from a flat list of comments
   * 
   * This function performs the following steps:
   * 1. Creates a map of comments for quick access
   * 2. Processes comments to ensure consistent structure
   * 3. Builds a hierarchical tree of comments
   * 4. Sorts root comments and their replies
   * 
   * @param comments - Flat list of comments to be transformed
   * @returns Hierarchically structured comments with root-level comments
   */
  const buildCommentHierarchy = (comments: Comment[]): Comment[] => {
    // Create a map to quickly access comments by ID
    const commentMap = new Map<number, Comment>();
    
    // First pass: Create base comment objects with consistent structure
    comments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        // Ensure replies array exists
        replies: comment.replies || [],
        // Initialize or preserve children count
        childrenCount: comment.childrenCount ?? 0
      });
    });

    // Container for root-level comments
    const rootComments: Comment[] = [];

    // Second pass: Build comment hierarchy
    comments.forEach(comment => {
      if (comment.parentId) {
        // Find parent and current comment in the map
        const parentComment = commentMap.get(comment.parentId);
        const processedComment = commentMap.get(comment.id);
        
        if (parentComment && processedComment) {
          // Ensure parent has replies array
          parentComment.replies = parentComment.replies || [];
          
          // Add current comment as a child
          parentComment.replies.push(processedComment);
          
          // Increment children count safely
          parentComment.childrenCount = (parentComment.childrenCount || 0) + 1;
        }
      } else {
        // If no parent, it's a root-level comment
        const processedComment = commentMap.get(comment.id);
        if (processedComment) {
          rootComments.push(processedComment);
        }
      }
    });

    // Sort root comments by creation date (most recent first)
    rootComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Sort replies for each root comment (oldest first)
    rootComments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

    return rootComments;
  };

  /**
   * Renders comment tree recursively
   * @param comments - List of comments
   * @param parentId - Parent comment ID
   * @param depth - Current nesting depth
   * @returns Rendered comment tree
   */
  const renderCommentTree = (comments: Comment[], parentId: number | null = null, depth: number = 0) => {
    // If first call, build hierarchy
    const processedComments = parentId === null 
      ? buildCommentHierarchy(comments)
      : comments.filter(comment => comment.parentId === parentId);

    return processedComments.map(comment => (
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
                  onClick={() => {
                    setReplyingTo(comment.id);
                  }}
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
              value={replyComment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setReplyComment(e.target.value);
                }
              }}
              placeholder="Write a reply..."
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="comment-input-footer">
              <span className="char-count">
                {replyComment.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button
                onClick={async () => {
                  if (!user) {
                    alert('Please log in to comment');
                    return;
                  }
                  
                  await onSubmitComment(replyComment, comment.id);
                  setReplyComment('');
                  setReplyingTo(null);
                }}
                disabled={!replyComment.trim()}
              >
                <FontAwesomeIcon icon={faComment} /> Submit
              </button>
            </div>
          </div>
        )}
 
        {depth < 3 && comment.replies && comment.replies.length > 0 && (
          <div className="nested-comments">
            {renderCommentTree(comment.replies, comment.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  /**
   * Handles comment deletion
   * @param commentId - ID of the comment to delete
   */
  const handleDeleteComment = async (commentId: number) => {
    try {
      if (onDeleteComment) {
        await onDeleteComment(commentId);
      } else {
        await deleteComment(analogyId, commentId);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  /**
   * Handles submission of main comment
   */
  const handleSubmitMainComment = async () => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    if (!mainComment.trim()) return;
    
    await onSubmitComment(mainComment);
    setMainComment('');
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
          placeholder={user 
            ? "Write a comment..." 
            : "Please log in to comment"}
          disabled={!user}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="comment-input-footer">
          <span className="char-count">
            {mainComment.length}/{MAX_COMMENT_LENGTH}
          </span>
          <button
            onClick={handleSubmitMainComment}
            disabled={!mainComment.trim() || !user}
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
          renderCommentTree(comments)
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