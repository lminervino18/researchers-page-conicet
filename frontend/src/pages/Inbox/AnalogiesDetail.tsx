import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { 
  Analogy, 
  Comment, 
  CommentRequestDTO, 
  PaginatedResponse, 
} from '../../types';
import { 
  getAnalogyById,  
} from '../../api/Analogy';
import { getCommentsByAnalogy, createComment, deleteComment } from '../../api/Comment';
import { authors as authorsList } from '../../api/Authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CommentSection from '../../components/analogies/CommentSection';
import LoginModal from '../../components/analogies/LoginModal';
import { useAuth } from '../../hooks/useAuth';
import './styles/AnalogiesDetail.css';
import SupportAnalogyButton from '../../components/analogies/SupportAnalogyButton';

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
  const [loginPurpose, setLoginPurpose] = useState<'support' | 'comment' | null>(null);
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
          throw new Error('Invalid analogy ID');
        }
  
        const analogyResponse = await getAnalogyById(Number(id));
  
        if (!analogyResponse) {
          throw new Error('Analogy not found');
        }
  
        setAnalogy(analogyResponse);
        
        const commentsResponse: PaginatedResponse<Comment[]> = await getCommentsByAnalogy(
          analogyResponse.id,
          page
        );
  
        const extractedComments = extractComments(
          commentsResponse.data ||
          commentsResponse.content ||
          []
        );
  
        // Use a functional update to ensure we're working with the latest state
        setComments(prevComments => {
          // If it's the first page, replace comments
          if (page === 0) {
            return extractedComments;
          }
          
          // Otherwise, append new comments, avoiding duplicates
          const uniqueComments = [
            ...prevComments,
            ...extractedComments.filter(
              newComment => !prevComments.some(existingComment => existingComment.id === newComment.id)
            )
          ];
  
          return uniqueComments;
        });
  
        setHasMore(extractedComments.length === 10);
      } catch (error) {
        // Error handling remains the same
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, page]);

  const isValidComment = (comment: any): comment is Comment => {
    return (
      typeof comment === 'object' &&
      comment !== null &&
      'id' in comment &&
      'content' in comment &&
      'userName' in comment &&
      'createdAt' in comment &&
      'analogyId' in comment &&
      typeof comment.id === 'number' &&
      typeof comment.content === 'string' &&
      typeof comment.userName === 'string' &&
      typeof comment.createdAt === 'string' &&
      typeof comment.analogyId === 'number'
    );
  };

      /**
     * Extracts and validates comments from raw input data
     * 
     * This function does the following:
     * 1. Normalizes input data to ensure it's an array
     * 2. Filters out invalid comments
     * 3. Prepares comments for hierarchical rendering
     * 
     * @param data - Raw input data containing comments
     * @returns An array of validated and prepared comments
     */
      const extractComments = (data: unknown): Comment[] => {
        // Normalize input data to ensure it's an array
        const rawComments = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'content' in data 
            ? (data as { content?: unknown }).content 
            : []);
      
        // Filter valid comments and prepare for rendering
        return (Array.isArray(rawComments) ? rawComments : [])
          .filter(isValidComment)
          .map(comment => ({
            ...comment,
            replies: [], // Prepare for tree structure
            childrenCount: 0
          }))
          // Prevent duplicates by using a Set based on comment ID
          .filter((comment, index, self) => 
            index === self.findIndex(c => c.id === comment.id)
          );
      };

      /**
     * Handles comment submission process
     * 
     * This function:
     * 1. Checks user authentication
     * 2. Prepares comment data
     * 3. Sends comment to backend
     * 4. Updates comments state
     * 
     * @param commentContent - Text content of the comment
     * @param parentId - Optional ID of parent comment for nested replies
     */
      const handleSubmitComment = async (commentContent: string, parentId?: number) => {
        if (!user) {
          setLoginPurpose('comment');
          setPendingComment({ content: commentContent, parentId });
          setIsLoginModalOpen(true);
          return;
        }
      
        console.log('llego el contendio del comentario', commentContent);
        if (!analogy) return;
      
        try {
          const commentData: CommentRequestDTO = {
            content: commentContent,
            userName: user.username,
            email: user.email,
            analogyId: analogy.id,
            parentId
          };
      
          // Submit comment to backend
          const response: Comment = await createComment(analogy.id, commentData); 
      
          console.log('Comment submitted successfully:', response);
      
          if (response) {
            setComments(prevComments => {
              const newComment = {
                ...response, 
                replies: [],
                childrenCount: 0
              } as Comment;
      
              return [newComment, ...prevComments];
            });
          }
        } catch (error) {
          console.error('Error submitting comment:', error);
        }
      };

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  
  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);

    if (loginPurpose === 'support') {
      // Support logic now handled by SupportAnalogyButton
    } else if (loginPurpose === 'comment' && pendingComment) {
      handleSubmitComment(pendingComment.content, pendingComment.parentId);
      setPendingComment(null);
    }
  };

  const loadMoreComments = () => {
    setPage(prevPage => prevPage + 1);
  };

    /**
   * Handles comment deletion process
   * 
   * This function:
   * 1. Validates analogy existence
   * 2. Sends delete request to backend
   * 3. Updates comments state by removing deleted comment
   * 
   * @param commentId - ID of the comment to be deleted
   * @returns Promise resolving to deletion result
   */
  const handleDeleteComment = async (commentId: number) => {
    // Validate analogy existence
    if (!analogy) return Promise.reject('No analogy found');

    try {
      // Send delete request to backend
      await deleteComment(analogy.id, commentId);

      // Update comments state by filtering out deleted comment
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting comment:', error);
      return Promise.reject(error);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
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
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  if (!analogy) {
    return (
      <div className="error-container">
        <p>No analogy found</p>
        <button onClick={() => navigate('/')}>Go Back</button>
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
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="analogy-content">
          <div className="analogy-metadata">
            <div className="authors">
              {analogy.authors.map(authorName => {
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
                  <span key={authorName} className="author-tag">{authorName}</span>
                );
              })}
            </div>
            <p className="creation-date">
              {new Date(analogy.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <h1 className="analogy-title">{analogy.title}</h1>
          <p className="full-description">{analogy.content}</p>

          <div className="youtube-videos">
            {analogy.links
              .filter(link => link.includes('youtube'))
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
              .filter(link => !link.includes('youtube'))
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
                  setLoginPurpose('support');
                  setIsLoginModalOpen(true);
                }}
              />
            </div>
            <CommentSection 
              comments={comments}
              loading={loading}
              hasMore={hasMore}
              analogyId={analogy.id}
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
