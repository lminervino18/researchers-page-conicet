import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  Analogy,
  Comment,
  CommentRequestDTO,
  CommentResponseDTO,
  PaginatedResponse,
  ApiResponse,
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
  const [loginPurpose, setLoginPurpose] = useState<
    "support" | "comment" | null
  >(null);
  const [pendingComment, setPendingComment] = useState<{
    content: string;
    parentId?: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error("Invalid analogy ID");
        }

        const analogyResponse = await getAnalogyById(Number(id));

        if (!analogyResponse) {
          throw new Error("Analogy not found");
        }

        setAnalogy(analogyResponse);

        const commentsResponse: PaginatedResponse<Comment[]> =
          await getCommentsByAnalogy(analogyResponse.id, page);

        const extractedComments = extractComments(
          commentsResponse.data || commentsResponse.content || []
        );

        setComments((prevComments) =>
          page === 0
            ? extractedComments
            : [...prevComments, ...extractedComments]
        );

        setHasMore(extractedComments.length === 10);
      } catch (error) {
        console.error("Error fetching data:", error);

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load analogy"
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

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

  /**
   * Extracts and organizes comments from raw input data
   *
   * This function does the following:
   * 1. Normalizes input data to ensure it's an array
   * 2. Validates each comment
   * 3. Creates a map of comments for easy lookup
   * 4. Builds a hierarchical structure of comments
   * 5. Sorts root comments and their replies
   *
   * @param data - Raw input data containing comments
   * @returns An array of root-level comments with nested replies
   */
  const extractComments = (data: unknown): Comment[] => {
    // Normalize input data to ensure it's an array
    const rawComments = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "content" in data
      ? (data as { content?: unknown }).content
      : [];

    // Log the processed raw comments
    console.log("Processed raw comments:", rawComments);

    // Create a map to store all comments for quick access
    const commentMap = new Map<number, Comment>();

    // Filter and prepare comments
    const validComments = (Array.isArray(rawComments) ? rawComments : [])
      .filter(isValidComment) // Remove invalid comments
      .map((comment) => {
        // Create a processed comment with additional properties
        const processedComment: Comment = {
          ...comment,
          replies: [], // Initialize empty replies array
          childrenCount: 0, // Initialize children count
        };

        // Store comment in map for quick access
        commentMap.set(comment.id, processedComment);

        return processedComment;
      });

    // Container for root-level comments
    const rootComments: Comment[] = [];

    // Build comment hierarchy
    validComments.forEach((comment) => {
      // Check if comment has a parent
      if (comment.parentId) {
        // Find the parent comment
        const parentComment = commentMap.get(comment.parentId);

        if (parentComment) {
          // Log found parent comment
          console.log("Found parent comment:", parentComment);

          // Ensure parent has replies array
          parentComment.replies = parentComment.replies || [];

          // Add current comment as a child
          parentComment.replies.push(comment);

          // Increment children count
          parentComment.childrenCount = (parentComment.childrenCount || 0) + 1;
        } else {
          // Log if parent comment is not found
          console.log("Parent comment not found for:", comment);
        }
      } else {
        // If no parent, it's a root-level comment
        rootComments.push(comment);
      }
    });

    // Log root comments before sorting
    console.log("Root comments before sorting:", rootComments);

    // Sort root comments by creation date (most recent first)
    rootComments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Sort replies for each root comment (oldest first)
    rootComments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

    // Log final root comments
    console.log("Final root comments:", rootComments);

    // Return only root-level comments (parent comments will have their children in 'replies')
    return rootComments;
  };

  const handleSubmitComment = async (
    commentContent: string,
    parentId?: number
  ) => {
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

      const response: ApiResponse<CommentResponseDTO> = await createComment(
        commentData
      );

      if (response && response.data && isValidComment(response.data)) {
        const newComment: Comment = {
          ...response.data,
          replies: [],
          childrenCount: 0,
        };

        setComments((prevComments) => {
          if (!parentId) {
            return [newComment, ...prevComments];
          }

          return prevComments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
                childrenCount: (comment.childrenCount || 0) + 1,
              };
            }
            return comment;
          });
        });
      }
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
      // Support logic now handled by SupportAnalogyButton
    } else if (loginPurpose === "comment" && pendingComment) {
      handleSubmitComment(pendingComment.content, pendingComment.parentId);
      setPendingComment(null);
    }
  };

  const loadMoreComments = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!analogy) return Promise.reject("No analogy found");

    try {
      await deleteComment(commentId);

      setComments((prevComments) => {
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments.filter((comment) => {
            if (comment.id === commentId) return false;

            if (comment.replies) {
              comment.replies = removeComment(comment.replies);
              comment.childrenCount = comment.replies.length;
            }

            return true;
          });
        };

        return removeComment(prevComments);
      });

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
          <div className="analogy-metadata">
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
          </div>

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

          <div className="interaction-section">
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
              hasMore={hasMore}
              onSubmitComment={handleSubmitComment}
              onLoadMoreComments={loadMoreComments}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalogiesDetail;
