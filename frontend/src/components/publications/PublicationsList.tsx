// src/components/publications/PublicationsList.tsx
import { FC, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faLink,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Research } from "../../types";
import SourcesModal from "../common/SourcesModal";
import "./styles/PublicationsList.css";
import { useTranslation } from "react-i18next";

interface PublicationsListProps {
  publications: Research[];
  onViewPdf: (id: number) => void;
  onDownloadPdf: (id: number) => void;
  downloading: number | null;
}

const PublicationsList: FC<PublicationsListProps> = ({
  publications,
  onViewPdf,
  onDownloadPdf,
  downloading,
}) => {
  const [activeSourcesId, setActiveSourcesId] = useState<number | null>(null);

  const { t } = useTranslation();

  // Utility: truncate text by number of words
  const truncateByWords = (text: string, wordLimit: number) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <div className="publications-list">
      {publications.length === 0 ? (
        <p className="no-publications">
          {t("publications.list.no_publications")}
        </p>
      ) : (
        publications.map((publication) => (
          <div key={publication.id} className="publication-card">
            <div className="publication-content">
              <div className="publication-main">
                <p className="publication-abstract">
                  {truncateByWords(publication.researchAbstract, 30)}
                </p>
                {publication.links.length > 0}
              </div>
              <div className="publication-actions">
                <button
                  className={`action-button ${
                    !publication.pdfPath ? "disabled" : ""
                  }`}
                  onClick={() => onViewPdf(publication.id)}
                  title={t(
                    `publications.${
                      publication.pdfPath ? "view_pdf" : "no_pdf"
                    }`
                  )}
                  disabled={!publication.pdfPath}
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                </button>
                <button
                  className={`action-button ${
                    !publication.pdfPath ? "disabled" : ""
                  }`}
                  onClick={() => onDownloadPdf(publication.id)}
                  title={t(
                    `publications.${
                      publication.pdfPath ? "download_pdf" : "no_pdf"
                    }`
                  )}
                  disabled={
                    !publication.pdfPath || downloading === publication.id
                  }
                >
                  {downloading === publication.id ? (
                    <span className="loading-spinner small"></span>
                  ) : (
                    <FontAwesomeIcon icon={faDownload} />
                  )}
                </button>
                <button
                  className={`action-button ${
                    !publication.links.length ? "disabled" : ""
                  }`}
                  onClick={() => setActiveSourcesId(publication.id)}
                  title={t(
                    `publications.${
                      publication.links.length ? "view_sources" : "no_sources"
                    }`
                  )}
                  disabled={!publication.links.length}
                >
                  <FontAwesomeIcon icon={faLink} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {activeSourcesId && (
        <SourcesModal
          sources={
            publications.find((p) => p.id === activeSourcesId)?.links || []
          }
          onClose={() => setActiveSourcesId(null)}
        />
      )}
    </div>
  );
};

export default PublicationsList;
