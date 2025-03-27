import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { Comment } from '../../types';
import './styles/CommentSection.css'; 

interface CommentSectionProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  onSubmitComment: (content: string) => Promise<void>;
  onLoadMoreComments: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  loading,
  hasMore,
  onSubmitComment,
  onLoadMoreComments
}) => {
  const [newComment, setNewComment] = useState('');

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
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <FontAwesomeIcon icon={faComment} /> Submit
        </button>
      </div>

      <div className="comments-list">
        {loading && comments.length === 0 ? (
          <div>Loading comments...</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
              <div className="comment-metadata">
                <span className="comment-author">{comment.userName}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
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