import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Analogy } from "../../types";
import { authors as authorsList } from "../../api/authors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faComment } from "@fortawesome/free-solid-svg-icons";
import {
  faYoutube,
  faFacebook,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import SupportAnalogyButton from "../analogies/SupportAnalogyButton";
import LoginModal from "./LoginModal";
import { useAuth } from "../../hooks/useAuth";
import FullScreenImageModal from "../common/FullScreenImageModal"; // Import the new modal
import { createPortal } from "react-dom"; // Import ReactDOM for portal rendering
import "./styles/AnalogiesList.css";
import { useTranslation } from "react-i18next";

interface AnalogiesListProps {
  analogies: Analogy[];
}

const truncateText = (text: string, maxLength: number = 200) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
};

const AnalogiesList: FC<AnalogiesListProps> = ({ analogies }) => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] =
    useState<Nullable<string>>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const { t } = useTranslation();

  type Nullable<T> = T | null | undefined;

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      (author) => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const handleAnalogyClick = (analogyId: number) => {
    navigate(`/analogies/${analogyId}`);
  };

  const getLinkIcon = (link: string) => {
    if (link.includes("youtube")) return <FontAwesomeIcon icon={faYoutube} />;
    if (link.includes("facebook")) return <FontAwesomeIcon icon={faFacebook} />;
    if (link.includes("tiktok")) return <FontAwesomeIcon icon={faTiktok} />;
    return <FontAwesomeIcon icon={faLink} />;
  };

  const getPreviewImage = (link: string) => {
    const youtubeId = getYoutubeId(link);
    return youtubeId ? (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video"
        allowFullScreen
      />
    ) : (
      <img
        src={link}
        alt={t("inbox.list.preview")}
        className="media-preview-image"
      />
    );
  };

  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);
  };

  const openImageFullscreen = (imageUrl: string) => {
    setIsImageLoading(true); // Start loading state
    setFullscreenImage(imageUrl);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
    setIsImageLoading(false); // Reset loading state
  };

  const handleImageLoad = () => {
    setIsImageLoading(false); // Image loaded successfully
  };

  return (
    <div className="analogies-list">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      {analogies.map((analogy) => (
        <div
          key={analogy.id}
          className="analogy-card"
          onClick={() => handleAnalogyClick(analogy.id)}
          style={{ cursor: "pointer" }}
        >
          <div className="analogy-header">
            <div className="analogy-author">
              {analogy.authors.map((authorName) => {
                const author = getAuthorData(authorName);
                return author ? (
                  <span key={authorName} className="author-tag">
                    <img
                      src={author.imageUrl}
                      alt={authorName}
                      className="author-image"
                    />
                    {authorName}
                  </span>
                ) : (
                  <span key={authorName} className="author-tag">
                    {authorName}
                  </span>
                );
              })}
            </div>
            <h2 className="analogy-preview-title">{analogy.title}</h2>
            <p className="analogy-date">
              {new Date(analogy.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="analogy-description">
            {truncateText(analogy.content || "")}
          </p>
          <div className="links">
            {analogy.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {getLinkIcon(link)}
              </a>
            ))}
          </div>

          <div className="previews">
            {analogy.links.map(
              (link, index) =>
                link.includes("youtube") && (
                  <div key={index} className="preview">
                    {getPreviewImage(link)}
                  </div>
                )
            )}
          </div>

          <div className="media-previews">
            {analogy.mediaLinks.map((media, index) => {
              const isMkv = media.url.toLowerCase().endsWith(".mkv");

              if (isMkv) {
                return (
                  <div key={index} className="preview">
                    <p className="mkv-warning">{t("inbox.list.warning_mkv")}</p>
                    <a
                      href={media.url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="download-button"
                    >
                      {t("inbox.list.download_mkv")}
                    </a>
                  </div>
                );
              }

              if (media.mediaType.includes("video")) {
                return (
                  <div key={index} className="preview">
                    <iframe
                      src={media.url}
                      title="Media video"
                      allowFullScreen
                    />
                  </div>
                );
              } else if (media.mediaType.includes("image")) {
                return (
                  <div
                    key={index}
                    className="preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageFullscreen(media.url);
                    }}
                  >
                    <img
                      src={media.url}
                      alt={t("inbox.list.preview")}
                      className="media-preview-image"
                      onLoad={handleImageLoad}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>

          <div
            className="interaction-buttons"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAnalogyClick(analogy.id);
              }}
            >
              <FontAwesomeIcon icon={faComment} /> {t("inbox.list.comment")}
            </button>
            <SupportAnalogyButton
              analogyId={analogy.id}
              userEmail={user?.email}
              onLoginRequired={() => {
                setIsLoginModalOpen(true);
              }}
            />
          </div>
        </div>
      ))}

      {fullscreenImage &&
        createPortal(
          <FullScreenImageModal
            imageUrl={fullscreenImage}
            isLoading={isImageLoading}
            onClose={closeFullscreenImage}
            onImageLoad={handleImageLoad}
          />,
          document.body // Append the modal outside of the analogy list
        )}
    </div>
  );
};

export default AnalogiesList;
