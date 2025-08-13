import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { News, PaginatedResponse } from "../../types";
import { getAllNews } from "../../api/news";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import { authors as authorsList } from "../../api/authors";
import "./styles/NewsSection.css";
import { useTranslation } from "react-i18next";

const NewsSection: FC = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { t } = useTranslation();

  const loadNews = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<News> = await getAllNews(0, 20);
      setNewsList(response.content || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t("news.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      (author) => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const filteredNews = newsList.filter(
    (news) =>
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.authors?.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <MainLayout>
      <div className="news-section-container">
        <div className="news-section-header">
          <h1>{t("news.news")}</h1>
          <div className="news-section-actions">
            <div className="news-section-search-container">
              <input
                type="text"
                placeholder={t("news.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="news-section-search-input"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="news-section-search-icon"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="news-section-loading">{t("news.loading")}</div>
        ) : error ? (
          <div className="news-section-error">{error}</div>
        ) : (
          <div className="news-section-list">
            {filteredNews.map((news) => (
              <div
                key={news.id}
                className="news-section-item"
                onClick={() => navigate(`/news/${news.id}`)}
              >
                <div className="news-section-authors-bar">
                  {news.authors?.map((name) => {
                    const author = getAuthorData(name);
                    return author ? (
                      <img
                        key={name}
                        src={author.imageUrl}
                        alt={name}
                        className="news-section-author-avatar"
                      />
                    ) : (
                      <div
                        key={name}
                        className="news-section-author-placeholder"
                      >
                        {name[0]}
                      </div>
                    );
                  })}
                </div>

                <div className="news-section-image-wrapper">
                  {news.previewImage ? (
                    <img
                      src={news.previewImage}
                      alt={news.title}
                      className="news-section-image"
                    />
                  ) : (
                    <div className="news-section-placeholder">
                      <FontAwesomeIcon
                        icon={faNewspaper}
                        className="news-section-placeholder-icon"
                      />
                    </div>
                  )}

                  <div className="news-section-title-overlay">
                    <h2>{news.title}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewsSection;
