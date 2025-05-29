import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  Analogy,
  Comment,
  CommentRequestDTO,
  PaginatedResponse,
} from "../../types";
import { getAnalogyById } from "../../api/Analogy";
import {
  getCommentsByAnalogy,
  createComment,
  deleteComment,
} from "../../api/Comment";
import { authors as authorsList } from "../../api/Authors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import CommentSection from "../../components/analogies/CommentSection";
import LoginModal from "../../components/analogies/LoginModal";
import { useAuth } from "../../hooks/useAuth";
import "./styles/AnalogiesDetail.css";
import SupportAnalogyButton from "../../components/analogies/SupportAnalogyButton";

const AnalogiesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [analogy, setAnalogy] = useState<Analogy | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPurpose, setLoginPurpose] = useState<"support" | "comment" | null>(null);
  const [pendingComment, setPendingComment] = useState<{ content: string; parentId?: number } | null>(null);

  const commentsSectionRef = useRef<HTMLDivElement>(null);

  const fetchComments = async (pageToLoad = 0) => {
    if (!analogy) return;

    setLoading(true);
    setError(null);

    try {
      const commentsResponse: PaginatedResponse<Comment[]> =
        await getCommentsByAnalogy(analogy.id, pageToLoad);

      const rawData = commentsResponse.data || commentsResponse.content || [];
      const extractedComments = extractComments(rawData);

      setComments((prevComments) =>
        pageToLoad === 0 ? extractedComments : [...prevComments, ...extractedComments]
      );

      setHasMore(extractedComments.length === 10);
      setPage(pageToLoad);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("Invalid analogy ID");

        const analogyResponse = await getAnalogyById(Number(id));
        if (!analogyResponse) throw new Error("Analogy not found");

        setAnalogy(analogyResponse);

        // Initial fetch of comments regardless of user state
        await fetchComments(0);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || error.message || "Failed to load analogy"
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Scroll comments into view on change
  useEffect(() => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [comments]);

  const isValidComment = (comment: any): comment is Comment => {
    return (
      typeof comment === "object" &&
      comment !== null &&
      "id" in comment &&
      "content" in comment &&
      "userName" in comment &&
      "createdAt" in comment &&
      "analogyId" in comment &&
      typeof comment.id === "number" &&
      typeof comment.content === "string" &&
      typeof comment.userName === "string" &&
      typeof comment.createdAt === "string" &&
      typeof comment.analogyId === "number"
    );
  };

  const extractComments = (data: unknown): Comment[] => {
    const rawComments = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "content" in data
      ? (data as { content?: unknown }).content
      : [];

    if (!Array.isArray(rawComments)) return [];

    const commentMap = new Map<number, Comment>();
    const validComments = rawComments
      .filter(isValidComment)
      .map((comment) => {
        const processedComment: Comment = {
          ...comment,
          replies: [],
          childrenCount: 0,
        };
        commentMap.set(comment.id, processedComment);
        return processedComment;
      });

    const rootComments: Comment[] = [];

    validComments.forEach((comment) => {
      if (comment.parentId) {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(comment);
          parentComment.childrenCount = (parentComment.childrenCount || 0) + 1;
        }
      } else {
        rootComments.push(comment);
      }
    });

    rootComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    rootComments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (commentContent: string, parentId?: number) => {
    if (!user) {
      setLoginPurpose("comment");
      setPendingComment({ content: commentContent, parentId });
      setIsLoginModalOpen(true);
      return;
    }

    if (!analogy) return;

    try {
      const commentData: CommentRequestDTO = {
        content: commentContent,
        userName: user.username,
        email: user.email,
        analogyId: analogy.id,
        parentId,
      };

      await createComment(analogy.id, commentData);

      await fetchComments(0);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      (author) => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);

    if (loginPurpose === "support") {
      // Support logic handled elsewhere
    } else if (loginPurpose === "comment" && pendingComment) {
      handleSubmitComment(pendingComment.content, pendingComment.parentId);
      setPendingComment(null);
    }
  };

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!analogy) return Promise.reject("No analogy found");

    try {
      await deleteComment(commentId);
      await fetchComments(0);
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting comment:", error);
      return Promise.reject(error);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analogy details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  if (!analogy) {
    return (
      <div className="error-container">
        <p>No analogy found</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  return (
    <MainLayout>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <div className="analogy-detail-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="analogy-content">
          <div className="authors">
            {analogy.authors.map((authorName) => {
              const author = getAuthorData(authorName);
              return author ? (
                <div key={authorName} className="author-profile">
                  <img
                    src={author.imageUrl}
                    alt={authorName}
                    className="author-profile-image"
                  />
                  <span className="author-name">{authorName}</span>
                </div>
              ) : (
                <span key={authorName} className="author-tag">
                  {authorName}
                </span>
              );
            })}
          </div>
          <p className="creation-date">
            {new Date(analogy.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h1 className="analogy-title">{analogy.title}</h1>
          <p className="full-description">{analogy.content}</p>

          <div className="youtube-videos">
            {analogy.links
              .filter((link) => link.includes("youtube"))
              .map((link, index) => {
                const embedUrl = getYoutubeEmbedUrl(link);
                return embedUrl ? (
                  <div key={index} className="youtube-video-large">
                    <iframe
                      src={embedUrl}
                      title={`YouTube video ${index + 1}`}
                      allowFullScreen
                    />
                  </div>
                ) : null;
              })}
          </div>

          <div className="external-links">
            {analogy.links
              .filter((link) => !link.includes("youtube"))
              .map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  {link}
                </a>
              ))}
          </div>

          <div className="interaction-section" ref={commentsSectionRef}>
            <div className="support-section">
              <SupportAnalogyButton
                analogyId={analogy.id}
                userEmail={user?.email}
                onLoginRequired={() => {
                  setLoginPurpose("support");
                  setIsLoginModalOpen(true);
                }}
              />
            </div>
            <CommentSection
              comments={comments}
              loading={loading}
              hasMore={hasMore && comments.length > 0}
              onSubmitComment={handleSubmitComment}
              onLoadMoreComments={loadMoreComments}
              onDeleteComment={handleDeleteComment}
              user={user}
              onRequestLogin={() => {
                setLoginPurpose("comment");
                setIsLoginModalOpen(true);
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalogiesDetail;
