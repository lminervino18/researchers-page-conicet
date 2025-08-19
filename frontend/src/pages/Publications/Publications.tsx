// src/pages/Publications/Publications.tsx
import { FC, useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import PublicationsList from "../../components/publications/PublicationsList";
import { Research } from "../../types";
import { getAllResearches } from "../../api/research";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./styles/Publications.css";
import { useTranslation } from "react-i18next";

const Publications: FC = () => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState<number | null>(null);

  const { t } = useTranslation();

  const loadPublications = async () => {
    try {
      setLoading(true);
      const response = await getAllResearches();
      setPublications(response.content);
      setError(null);
    } catch (err) {
      setError(t("publications.error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const handlePdfView = (id: number) => {
    const publication = publications.find((p) => p.id === id);
    if (publication?.pdfPath) {
      window.open(publication.pdfPath, "_blank");
    } else {
      setError(t("publications.pdf_unavailable"));
    }
  };

  const handlePdfDownload = async (id: number) => {
    const publication = publications.find((p) => p.id === id);
    if (!publication?.pdfPath) {
      setError(t("publications.pdf_unavailable"));
      return;
    }

    setDownloading(id);
    try {
      const response = await fetch(publication.pdfPath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `research-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError(t("publications.download_error"));
    } finally {
      setDownloading(null);
    }
  };

  const filteredPublications = publications.filter(
    (pub) =>
      pub.researchAbstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <MainLayout>
      <div className="publications-container">
        <div className="publications-header">
          <h1>{t("publications.title")}</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder={t("publications.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">{t("publications.loading")}</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <PublicationsList
            publications={filteredPublications}
            onViewPdf={handlePdfView}
            onDownloadPdf={handlePdfDownload}
            downloading={downloading}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Publications;
