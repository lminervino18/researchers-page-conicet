// src/pages/news/NewsDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { News } from "../../types";
import { getNewsById } from "../../api/news";
import { authors as authorsList } from "../../api/authors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import FullScreenImageModal from "../../components/common/FullScreenImageModal";
import "./styles/NewsDetail.css";
import { useTranslation } from "react-i18next";

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("Invalid news ID");

        const newsResponse = await getNewsById(Number(id));
        if (!newsResponse) throw new Error("News not found");

        setNews(newsResponse);
      } catch (error) {
        console.error("Error fetching news:", error);
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              error.message ||
              t("news.detail.error")
          );
        } else {
          setError(t("unexpected_error"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      (author) => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const openMediaFullscreen = (mediaUrl: string) => {
    setIsImageLoading(true);
    setFullscreenMedia(mediaUrl);
  };

  const closeFullscreenMedia = () => {
    setFullscreenMedia(null);
    setIsImageLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t("news.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>{t("go_back")}</button>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="error-container">
        <p>{t("news.detail.no_news")}</p>
        <button onClick={() => navigate("/")}>{t("go_back")}</button>
      </div>
    );
  }

  const galleryMedia = news.mediaLinks.filter(
    (m) => m.url !== news.previewImage
  );

  return (
    <MainLayout>
      {fullscreenMedia && (
        <FullScreenImageModal
          imageUrl={fullscreenMedia}
          isLoading={isImageLoading}
          onClose={closeFullscreenMedia}
          onImageLoad={() => setIsImageLoading(false)}
        />
      )}

      <div className="news-detail-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> {t("back")}
        </button>

        {/* Authors & date */}
        <div className="news-meta">
          <div className="news-authors">
            {news.authors.map((authorName) => {
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
            {new Date(news.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Cover */}
        <div className="news-cover">
          {news.previewImage ? (
            <img
              src={news.previewImage}
              alt={news.title}
              className="news-cover-image"
            />
          ) : (
            <div className="news-placeholder-cover">
              <FontAwesomeIcon
                icon={faNewspaper}
                className="news-placeholder-icon"
              />
            </div>
          )}
          <div className="news-cover-overlay">
            <h1 className="news-title">{news.title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="news-content">{news.content}</div>

        {/* Gallery */}
        {galleryMedia.length > 0 && (
          <div className="news-media-gallery">
            {galleryMedia.map((media, index) => (
              <div
                key={index}
                className="media-item"
                onClick={
                  media.mediaType.includes("video")
                    ? undefined // No abrir modal para videos
                    : () => openMediaFullscreen(media.url)
                }
                style={{
                  cursor: media.mediaType.includes("video")
                    ? "default"
                    : "pointer",
                }}
              >
                {media.mediaType.includes("video") ? (
                  <video controls>
                    <source src={media.url} />
                  </video>
                ) : (
                  <img src={media.url} alt={`media-${index}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {news.links.length > 0 && (
          <div className="news-links">
            <h3>{t("news.detail.related_links")}</h3>
            {news.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewsDetail;
