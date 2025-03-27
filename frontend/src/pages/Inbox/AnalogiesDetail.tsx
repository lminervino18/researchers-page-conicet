import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Analogy, Comment, PaginatedResponse } from '../../types';
import { 
  getAnalogyById,  
} from '../../api/Analogy';
import { getCommentsByAnalogy, createComment, deleteComment } from '../../api/Comment';
import { authors as authorsList } from '../../api/Authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
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
  const [pendingComment, setPendingComment] = useState<string | null>(null);

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

        setComments(prevComments =>
          page === 0
            ? extractedComments
            : [...prevComments, ...extractedComments]
        );

        setHasMore(extractedComments.length === 10);
      } catch (error) {
        console.error('Error fetching data:', error);

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

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

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

  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);

    if (loginPurpose === 'support') {
      // Support logic now handled by SupportAnalogyButton
    } else if (loginPurpose === 'comment' && pendingComment) {
      handleSubmitComment(pendingComment);
      setPendingComment(null);
    }
  };

  const loadMoreComments = () => {
    setPage(prevPage => prevPage + 1);
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
              onDeleteComment={(commentId) => {
                setComments(prevComments => 
                  prevComments.filter(comment => comment.id !== commentId)
                );
                return deleteComment(analogy.id, commentId);
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalogiesDetail;