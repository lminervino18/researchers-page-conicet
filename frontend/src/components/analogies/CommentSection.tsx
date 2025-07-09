import React, { useEffect, useRef, useState } from "react";
import {
  getSupportCountForComment,
  getSupportedCommentsByEmail,
  addSupportToComment,
  removeSupportFromComment,
  getCommentsByAnalogy,
  deleteComment,
  createComment,
} from "../../api/comment";
import { Comment } from "../../types";
import { getColorForName, getInitials } from "../../utils/ColorUtils";
import ConfirmationModal from "./ConfirmationModal";
import "./styles/CommentSection.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { faComment, faTrash, faReply } from "@fortawesome/free-solid-svg-icons";


interface User {
  email: string;
  username: string;
}

interface CommentSectionProps {
  analogyId: number;
  user?: User | null;
  onRequestLogin?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ analogyId, user, onRequestLogin }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mainComment, setMainComment] = useState("");
  const [replyComment, setReplyComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supportCounts, setSupportCounts] = useState<Record<number, number>>({});
  const [userSupportedIds, setUserSupportedIds] = useState<number[]>([]);

  const commentsListRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const MAX_COMMENT_LENGTH = 250;

  const isValidComment = (c: Comment) => typeof c.content === "string" && c.content.length > 0;

  const extractComments = (fetched: Comment[]) => {
    const seen = new Set<number>();
    const map = new Map<number, Comment>();
    for (const c of fetched.filter(isValidComment)) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      c.replies = [];
      map.set(c.id, c);
    }
    for (const c of map.values()) {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies!.push(c);
      }
    }
    return Array.from(map.values()).filter((c) => !c.parentId);
  };

  const loadSupportData = async (comments: Comment[]) => {
  const ids = comments.map((c) => c.id);
  const counts: Record<number, number> = {};
  
  for (const id of ids) {
    try {
      counts[id] = await getSupportCountForComment(id); // Get support count for each comment
    } catch {
      counts[id] = 0; // Fallback to 0 if there's an error
    }
  }

  setSupportCounts(counts);

  // If user is logged in, load user's supported comments
  if (user) {
    try {
      const ids = await getSupportedCommentsByEmail(user.email);
      setUserSupportedIds(ids);
    } catch {
      setUserSupportedIds([]);
    }
  }
};


  const loadSupportedIds = async () => {
    if (!user) return;
    try {
      const ids = await getSupportedCommentsByEmail(user.email);
      setUserSupportedIds(ids);
      
    } catch {
      setUserSupportedIds([]);
    }
  };

  const loadComments = async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const fetched = await getCommentsByAnalogy(analogyId, page);
      const commentsRaw =
        fetched.content ??
        (Array.isArray((fetched.data as any)?.content)
          ? (fetched.data as any).content
          : []);
      const newComments = extractComments(commentsRaw);

      if (newComments.length > 0) {
        setComments((prev) => [...prev, ...newComments]);
        await loadSupportData(commentsRaw);
      }

      if (commentsRaw.length === 0) {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const reloadAll = () => {
    setComments([]);
    setPage(0);
    setHasMore(true);
  };

  useEffect(() => {
    reloadAll(); // reset when analogyId changes
  }, [analogyId]);

  useEffect(() => {
    loadComments();
  }, [page]);

  useEffect(() => {
    loadSupportedIds();
  }, [user]);

  useEffect(() => {
    if (comments.length === 0) {
      loadComments()
    }
  }, [comments]); 

  const handleSubmit = async (content: string, parentId?: number) => {
  if (!user) {
    if (onRequestLogin) onRequestLogin();
    return;
  }

  const commentData = {
    content,
    userName: user.username,
    email: user.email,
    parentId: parentId ?? undefined,
  };

  try {
    await createComment(analogyId, commentData);

    reloadAll();
    setMainComment("");
    setReplyComment("");
    setReplyingTo(null);

    await loadComments();
    await loadSupportedIds();
  } catch (e) {
    console.error("Error posting comment:", e);
  }
};


  const handleDelete = async (id: number) => {
  try {
    await deleteComment(id);
    reloadAll();
    await loadComments();
  } catch (e) {
    console.error("Error deleting:", e);
  }
};


  const toggleSupport = async (commentId: number) => {
  if (!user) {
    if (onRequestLogin) onRequestLogin();
    return;
  }

  try {
    if (userSupportedIds.includes(commentId)) {
      await removeSupportFromComment(commentId, user.email);
    } else {
      await addSupportToComment(commentId, user.email);
    }

    const updated = await getSupportCountForComment(commentId); // Update support count after toggling
    setSupportCounts((prev) => ({ ...prev, [commentId]: updated }));
    
    await loadSupportedIds(); // Reload the user's supported comments
  } catch (e) {
    console.error("Error toggling support:", e);
  }
};


  const flatten = (c: Comment): Comment[] => [c, ...(c.replies?.flatMap(flatten) || [])];

  const renderTree = (nodes: Comment[], depth = 0) =>
    nodes.map((comment) => (
      
      
      <div key={comment.id} className={`comment depth-${depth}`} style={{ marginLeft: depth * 20 }}>
        <div className="comment-content">
          <div className="user-avatar" style={{ backgroundColor: getColorForName(comment.userName), color: "white" }}>
            {getInitials(comment.userName)}
          </div>
          <div className="comment-body">
            <p>{comment.content}</p>
            <div className="comment-metadata">
              <span>{comment.userName}</span>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              <button
              className={`comment-support-button ${userSupportedIds.includes(comment.id) ? "supported" : ""}`}
              onClick={() => toggleSupport(comment.id)}
            >
              <FontAwesomeIcon icon={faThumbsUp} /> {supportCounts[comment.id] ?? 0}
            </button>

              {user?.email === comment.email && (
                <button onClick={() => { setCommentToDelete(comment.id); setIsModalOpen(true); }}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              {depth < 3 && (
                <button onClick={() => setReplyingTo(comment.id)}>
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
              onChange={(e) => setReplyComment(e.target.value)}
              placeholder={user ? "Write a reply..." : "Please log in"}
              disabled={!user}
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="comment-input-footer">
              <span>{replyComment.length}/{MAX_COMMENT_LENGTH}</span>
              <button disabled={!replyComment.trim()} onClick={() => handleSubmit(replyComment, comment.id)}>
                <FontAwesomeIcon icon={faComment} /> Submit
              </button>
            </div>
          </div>
        )}

        {comment.replies && renderTree(comment.replies, depth + 1)}
      </div>
    ));

  return (
    <div className="comments-section">
      <h2>Comments</h2>

      <div className="comment-input">
        <textarea
          value={mainComment}
          onChange={(e) => setMainComment(e.target.value)}
          placeholder={user ? "Write a comment..." : "Please log in"}
          disabled={!user}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <div className="comment-input-footer">
          <span>{mainComment.length}/{MAX_COMMENT_LENGTH}</span>
          <button disabled={!mainComment.trim()} onClick={() => handleSubmit(mainComment)}>
            <FontAwesomeIcon icon={faComment} /> Submit
          </button>
        </div>
      </div>

      <div className="comments-list" ref={commentsListRef}>
        {comments.length === 0 ? (
          <div>{loading ? "Loading..." : "No comments yet"}</div>
        ) : (
          renderTree(comments)
        )}
      </div>

      {hasMore && (
        <button onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
          {loading ? "Loading..." : "Load More Comments"}
        </button>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => { if (commentToDelete !== null) handleDelete(commentToDelete); setIsModalOpen(false); }}
        message="Are you sure you want to delete this comment?"
      />
    </div>
  );
};

export default CommentSection;
