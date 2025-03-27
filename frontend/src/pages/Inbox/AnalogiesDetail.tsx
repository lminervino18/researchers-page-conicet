import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Analogy, Comment, PaginatedResponse } from '../../types';
import { 
  getAnalogyById, 
  addSupport, 
  getSupportCount  // Import new support count function
} from '../../api/Analogy';
import { getCommentsByAnalogy, createComment } from '../../api/Comment';
import { authors as authorsList } from '../../api/Authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CommentSection from './CommentSection';
import LoginModal from './LoginModal';
import { useAuth } from '../../hooks/useAuth';
import './styles/AnalogiesDetail.css';

/**
 * Detailed view component for an individual analogy
 * Provides comprehensive information and interaction capabilities
 */
const AnalogiesDetail: React.FC = () => {
  // Extract analogy ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // State management for component data and UI
  const [analogy, setAnalogy] = useState<Analogy | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [supportCount, setSupportCount] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPurpose, setLoginPurpose] = useState<'support' | 'comment' | null>(null);
  const [pendingComment, setPendingComment] = useState<string | null>(null);

  /**
   * Fetches the current support count for an analogy
   * Updates the supportCount state
   * 
   * @param analogyId - ID of the analogy to fetch support count
   */
  const fetchSupportCount = async (analogyId: number) => {
    try {
      const count = await getSupportCount(analogyId);
      setSupportCount(count);
    } catch (error) {
      console.error('Error fetching support count:', error);
    }
  };

  /**
   * Fetch analogy details and comments on component mount or page change
   * Handles data loading, error management, and pagination
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error('Invalid analogy ID');
        }

        // Fetch analogy details
        const analogyResponse = await getAnalogyById(Number(id));

        if (!analogyResponse) {
          throw new Error('Analogy not found');
        }

        setAnalogy(analogyResponse);
        
        // Fetch support count
        await fetchSupportCount(analogyResponse.id);

        // Fetch comments
        const commentsResponse: PaginatedResponse<Comment[]> = await getCommentsByAnalogy(
          analogyResponse.id,
          page
        );

        // Extract and validate comments
        const extractComments = (data: unknown): Comment[] => {
          if (Array.isArray(data)) {
            return data.filter(isValidComment);
          }

          if (data && typeof data === 'object' && 'content' in data) {
            const contentData = (data as { content?: unknown }).content;

            if (Array.isArray(contentData)) {
              return contentData.filter(isValidComment);
            }
          }

          return [];
        };

        const extractedComments = extractComments(
          commentsResponse.data ||
          commentsResponse.content ||
          []
        );

        // Update comments state with pagination support
        setComments(prevComments =>
          page === 0
            ? extractedComments
            : [...prevComments, ...extractedComments]
        );

        // Determine if more comments are available
        setHasMore(extractedComments.length === 10);
      } catch (error) {
        console.error('Error fetching data:', error);

        // Handle and display errors
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
            error.message ||
            'Failed to load analogy'
          );
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

  /**
   * Validates comment structure
   * 
   * @param comment - Unknown object to validate
   * @returns Boolean indicating if object is a valid comment
   */
  const isValidComment = (comment: unknown): comment is Comment => {
    return (
      typeof comment === 'object' &&
      comment !== null &&
      'id' in comment &&
      'content' in comment &&
      'userName' in comment &&
      'createdAt' in comment &&
      typeof (comment as Comment).id === 'number' &&
      typeof (comment as Comment).content === 'string' &&
      typeof (comment as Comment).userName === 'string' &&
      typeof (comment as Comment).createdAt === 'string'
    );
  };

  /**
   * Retrieves author data based on name
   * 
   * @param authorName - Full name of the author
   * @returns Author data or undefined
   */
  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  /**
   * Handles adding support to an analogy
   * Requires user authentication
   */
  const handleAddSupport = async () => {
    if (!user) {
      setLoginPurpose('support');
      setIsLoginModalOpen(true);
      return;
    }

    if (!analogy) return;

    try {
      const response = await addSupport(analogy.id, user.email);
      if (response.data) {
        // Refresh support count after adding support
        await fetchSupportCount(analogy.id);
      }
    } catch (error) {
      console.error('Error adding support:', error);
    }
  };

  /**
   * Handles comment submission
   * Requires user authentication
   * 
   * @param commentContent - Text content of the comment
   */
  const handleSubmitComment = async (commentContent: string) => {
    if (!user) {
      setLoginPurpose('comment');
      setPendingComment(commentContent);
      setIsLoginModalOpen(true);
      return;
    }

    if (!analogy) return;

    try {
      const commentData = {
        content: commentContent,
        userName: user.username,
        email: user.email
      };

      const response = await createComment(analogy.id, commentData);

      if (isValidComment(response.data)) {
        setComments(prevComments => [response.data, ...prevComments]);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  /**
   * Handles user login process
   * Completes pending support or comment action
   * 
   * @param username - User's username
   * @param email - User's email
   */
  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);

    if (loginPurpose === 'support') {
      handleAddSupport();
    } else if (loginPurpose === 'comment' && pendingComment) {
      handleSubmitComment(pendingComment);
      setPendingComment(null);
    }
  };

  /**
   * Loads more comments for pagination
   */
  const loadMoreComments = () => {
    setPage(prevPage => prevPage + 1);
  };

  /**
   * Converts YouTube URL to embeddable iframe URL
   * 
   * @param url - YouTube video URL
   * @returns Embeddable URL or null
   */
  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analogy details...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  // Render not found state
  if (!analogy) {
    return (
      <div className="error-container">
        <p>No analogy found</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  // Main render
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
              <button
                className="support-btn"
                onClick={handleAddSupport}
              >
                <FontAwesomeIcon icon={faThumbsUp} /> Support
              </button>
              <span className="support-count">{supportCount} Supports</span>
            </div>

            <CommentSection 
              comments={comments}
              loading={loading}
              hasMore={hasMore}
              onSubmitComment={handleSubmitComment}
              onLoadMoreComments={loadMoreComments}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalogiesDetail;