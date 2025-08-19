// src/components/common/PublicationsModal.tsx
import { FC, useState, useEffect } from "react";
import { Research } from "../../types";
import PublicationsList from "../publications/PublicationsList";
import { searchByAuthor } from "../../api/research";
import "./styles/PublicationsModal.css";
import { useTranslation } from "react-i18next";

interface PublicationsModalProps {
  authorName: string;
  onClose: () => void;
}

const PublicationsModal: FC<PublicationsModalProps> = ({
  authorName,
  onClose,
}) => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        const fetchedPublications = await searchByAuthor(authorName);
        setPublications(fetchedPublications);
      } catch (err) {
        setError(t("publications.error"));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector(".publications-modal");
      if (modal && !modal.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [authorName, onClose]);

  const handleViewPdf = (id: number) => {
    const publication = publications.find((p) => p.id === id);
    if (publication?.pdfPath) {
      window.open(publication.pdfPath, "_blank");
    } else {
      console.error("No PDF URL found for this publication.");
    }
  };

  const handleDownloadPdf = async (id: number) => {
    const publication = publications.find((p) => p.id === id);
    if (publication?.pdfPath) {
      try {
        setDownloading(id);
        const response = await fetch(publication.pdfPath);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `publication_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error downloading PDF:", err);
      } finally {
        setDownloading(null);
      }
    } else {
      console.error("No PDF URL found for this publication.");
    }
  };

  return (
    <div className="publications-modal-overlay">
      <div className="publications-modal">
        <button className="publications-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="publications-modal-content">
          <h2>{`${t("publications.of")} ${authorName}`}</h2>

          {isLoading ? (
            <p className="loading-message">{t("publications.loading")}</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <PublicationsList
              publications={publications}
              onViewPdf={handleViewPdf}
              onDownloadPdf={handleDownloadPdf}
              downloading={downloading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationsModal;
