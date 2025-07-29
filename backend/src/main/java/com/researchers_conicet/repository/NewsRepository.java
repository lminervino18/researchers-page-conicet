package com.researchers_conicet.repository;

import com.researchers_conicet.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for News entity.
 */
@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    /**
     * Searches in the title text, case insensitive.
     */
    List<News> findByTitleContainingIgnoreCase(String text);

    /**
     * Finds all news articles by an exact author name.
     */
    @Query("SELECT n FROM News n WHERE :authorName MEMBER OF n.authors")
    List<News> findByAuthor(@Param("authorName") String authorName);

    /**
     * Finds news articles where author name contains the given text.
     */
    @Query("SELECT n FROM News n WHERE LOWER(n.authors) LIKE LOWER(CONCAT('%', :partialName, '%'))")
    List<News> findByAuthorNameContaining(@Param("partialName") String partialName);

    /**
     * Finds news articles created between two dates.
     */
    List<News> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Finds all news articles created today.
     */
    @Query("SELECT n FROM News n WHERE DATE(n.createdAt) = CURRENT_DATE")
    List<News> findTodayNews();

    /**
     * Returns the most recent news articles.
     */
    @Query("SELECT n FROM News n ORDER BY n.createdAt DESC")
    List<News> findLatestNews(Pageable pageable);

    /**
     * Finds news articles that contain an exact URL in their links.
     */
    @Query("SELECT n FROM News n WHERE :url MEMBER OF n.links")
    List<News> findByLink(@Param("url") String url);

    /**
     * Finds news articles with links containing a specific domain.
     */
    @Query("SELECT n FROM News n WHERE LOWER(n.links) LIKE LOWER(CONCAT('%', :domain, '%'))")
    List<News> findByLinkDomain(@Param("domain") String domain);

    /**
     * Full text search across title and authors.
     */
    @Query("SELECT DISTINCT n FROM News n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :term, '%')) OR LOWER(n.authors) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<News> searchEverywhere(@Param("term") String term);

    /**
     * Counts news articles with more than X authors.
     */
    @Query("SELECT COUNT(n) FROM News n WHERE SIZE(n.authors) > :authorCount")
    Long countNewsWithMoreThanXAuthors(@Param("authorCount") int authorCount);

    /**
     * Counts news articles that have at least one external link.
     */
    @Query("SELECT COUNT(n) FROM News n WHERE SIZE(n.links) > 0")
    Long countNewsWithLinks();

    /**
     * Paginated search in title.
     */
    @Query("SELECT n FROM News n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<News> findByKeywordInTitle(@Param("keyword") String keyword, Pageable pageable);
}
