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

  const organizeComments = () => {
    
    const commentMap = new Map<number, Comment>();
  
    comments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });
  
    return commentMap;
  };

/**
 * Renders a tree of comments recursively
 * 
 * This function performs the following:
 * 1. Determines which comments to render based on parentId
 * 2. Maps through the comments and renders each comment
 * 3. Handles nested replies and their respective UI
 * 
 * @param commentMap - Map of all comments
 * @param parentId - ID of the parent comment (null for root comments)
 * @param depth - Current depth in the comment tree
 */
 const renderCommentTree = (commentMap: Map<number, Comment>, parentId: number | null = null, depth: number = 0) => {
 console.log(`Rendering comment tree - Depth: ${depth}, ParentId: ${parentId}`, {
   commentsCount: commentMap.size
 });

 // Determine comments to render
 // If parentId is null, render root comments
 // Otherwise, render children of the specified parent
 const commentsToRender = parentId === null 
   ? Array.from(commentMap.values())
   : commentMap.get(parentId)?.replies || [];

 return commentsToRender.map(comment => {
   console.log(`Rendering comment - ID: ${comment.id}, Depth: ${depth}`, {
     content: comment.content,
     hasReplies: comment.replies && comment.replies.length > 0,
     parentId: comment.parentId
   });

   return (
     <div 
       key={comment.id} 
       className={`comment depth-${depth}`}
       style={{ 
         marginLeft: depth > 0 ? `${depth * 20}px` : '0',
         borderLeft: depth > 0 ? '2px solid var(--border-color)' : 'none'
       }}
     >
       {/* Comment content container */}
       <div className="comment-content">
         {/* User avatar */}
         <div 
           className="user-avatar" 
           style={{ 
             backgroundColor: getColorForName(comment.userName),
             color: 'white'
           }}
         >
           {getInitials(comment.userName)}
         </div>

         {/* Comment body */}
         <div className="comment-body">
           <p>{comment.content}</p>
           
           {/* Comment metadata */}
           <div className="comment-metadata">
             <span className="comment-author">{comment.userName}</span>
             <span className="comment-date">
               {new Date(comment.createdAt).toLocaleString()}
             </span>
             
             {/* Delete comment button */}
             {user?.email === comment.email && (
               <button 
                 className="delete-comment-btn"
                 onClick={() => handleDeleteComment(comment.id)}
               >
                 <FontAwesomeIcon icon={faTrash} />
               </button>
             )}
             
             {/* Reply button */}
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
 
       {/* Reply input section */}
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
 
       {/* Render nested comments */}
       {comment.replies && comment.replies.length > 0 && (
         <div className="nested-comments">
           {renderCommentTree(commentMap, comment.id, depth + 1)}
         </div>
       )}
     </div>
   );
 });
};

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
          renderCommentTree(organizeComments())
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