import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { Analogy } from "../../types";
import { getAnalogyById } from "../../api/analogy";
import { authors as authorsList } from "../../api/authors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import CommentSection from "../../components/analogies/CommentSection";
import LoginModal from "../../components/analogies/LoginModal";
import LogoutConfirmModal from "../../components/analogies/LogoutConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import FullScreenImageModal from "../../components/common/FullScreenImageModal"; // Import modal component
import SupportAnalogyButton from "../../components/analogies/SupportAnalogyButton";
import "./styles/AnalogiesDetail.css";
import { useTranslation } from "react-i18next";

const AnalogiesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const [analogy, setAnalogy] = useState<Analogy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null); // For full-screen media
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loginPurpose, setLoginPurpose] = useState<
    "support" | "comment" | null
  >(null);
  const [pendingComment, setPendingComment] = useState<{
    content: string;
    parentId?: number;
  } | null>(null);

  const { t } = useTranslation();

  const commentsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("Invalid analogy ID");

        const analogyResponse = await getAnalogyById(Number(id));
        if (!analogyResponse) throw new Error("Analogy not found");

        setAnalogy(analogyResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              error.message ||
              t("analogies.error")
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

  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);

    if (loginPurpose === "support") return;

    if (loginPurpose === "comment" && pendingComment) {
      setPendingComment(null);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
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
        <p>{t("analogies.loading")}</p>
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

  if (!analogy) {
    return (
      <div className="error-container">
        <p>{t("analogies.no_analogy")}</p>
        <button onClick={() => navigate("/")}>{t("go_back")}</button>
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
      {fullscreenMedia && (
        <FullScreenImageModal
          imageUrl={fullscreenMedia}
          isLoading={isImageLoading}
          onClose={closeFullscreenMedia}
          onImageLoad={() => setIsImageLoading(false)}
        />
      )}

      <div className="analogy-detail-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> {t("back")}
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

          {/* New section for media links */}
          <div className="detail-media-links-section">
            {analogy.mediaLinks.map((media, index) => {
              if (media.mediaType.includes("video")) {
                return (
                  <div
                    key={index}
                    className="detail-media-preview"
                    onClick={() => openMediaFullscreen(media.url)}
                  >
                    <video width="100%" height="auto" controls>
                      <source src={media.url} />
                    </video>
                  </div>
                );
              } else if (media.mediaType.includes("image")) {
                return (
                  <div
                    key={index}
                    className="detail-media-preview"
                    onClick={() => openMediaFullscreen(media.url)}
                  >
                    <img
                      src={media.url}
                      alt={`Media image ${index + 1}`}
                      className="detail-media-preview-image"
                    />
                  </div>
                );
              }
              return null;
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
            <div className="interaction-header">
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

              <div className="auth-button-section">
                {user ? (
                  <>
                    <button
                      className="logout-button"
                      onClick={() => setIsLogoutModalOpen(true)}
                    >
                      {t("logout.logout")}
                    </button>
                    <LogoutConfirmModal
                      isOpen={isLogoutModalOpen}
                      onConfirm={() => {
                        logout();
                        setIsLogoutModalOpen(false);
                      }}
                      onCancel={() => setIsLogoutModalOpen(false)}
                    />
                  </>
                ) : (
                  <button
                    className="login-button"
                    onClick={() => {
                      setLoginPurpose("comment");
                      setIsLoginModalOpen(true);
                    }}
                  >
                    {t("login.login")}
                  </button>
                )}
              </div>
            </div>

            <CommentSection
              key={user?.email ?? "guest"} // fuerza el remount si cambia el usuario
              analogyId={analogy.id}
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
