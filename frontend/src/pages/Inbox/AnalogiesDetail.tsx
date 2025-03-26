import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Analogy, Comment, PaginatedResponse } from '../../types';
import { getAnalogyById, addSupport } from '../../api/Analogy';
import { getCommentsByAnalogy, createComment } from '../../api/Comment';
import { authors as authorsList } from '../../api/Authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './styles/AnalogiesDetail.css';

const AnalogiesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analogy, setAnalogy] = useState<Analogy | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [supportCount, setSupportCount] = useState(0);

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

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !analogy) return;

    try {
      const commentData = {
        content: newComment,
        userName: 'Current User',
        email: 'user@example.com'
      };

      const response = await createComment(analogy.id, commentData);

      if (isValidComment(response.data)) {
        setComments(prevComments => [response.data, ...prevComments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleAddSupport = async () => {
    if (!analogy) return;

    try {
      const response = await addSupport(analogy.id, 'user@example.com');
      if (response.data) {
        setSupportCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error adding support:', error);
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

            <div className="comments-section">
              <h2>Comments</h2>

              {error && (
                <div className="error-message">
                  {error}
                  <button onClick={() => setError(null)}>Retry</button>
                </div>
              )}

              {!error && (
                <>
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
                    {loading && page === 0 ? (
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
                      onClick={loadMoreComments}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Comments'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalogiesDetail;
