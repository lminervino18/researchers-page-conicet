package com.researchers_conicet.repository;

import com.researchers_conicet.entity.New;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for New entity.
 */
@Repository
public interface NewRepository extends JpaRepository<New, Long> {

    /**
     * Searches in the title text, case insensitive.
     * Example: "climate" would find all news mentioning climate in their title.
     */
    List<New> findByTitleContainingIgnoreCase(String text);

    /**
     * Finds all news articles by an exact author name.
     * Example: "John Smith" would find all news articles where "John Smith" is listed as an author.
     */
    @Query("SELECT n FROM New n WHERE :authorName MEMBER OF n.authors")
    List<New> findByAuthor(@Param("authorName") String authorName);

    /**
     * Finds news articles where author name contains the given text.
     * Example: "Smith" would match "John Smith", "Smith John", etc.
     */
    @Query("SELECT n FROM New n WHERE LOWER(n.authors) LIKE LOWER(CONCAT('%', :partialName, '%'))")
    List<New> findByAuthorNameContaining(@Param("partialName") String partialName);

    /**
     * Finds news articles created between two dates.
     * Useful for finding news articles from a specific time period.
     */
    List<New> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Finds all news articles created today.
     * Uses the database's current date for comparison.
     */
    @Query("SELECT n FROM New n WHERE DATE(n.createdAt) = CURRENT_DATE")
    List<New> findTodayNews();

    /**
     * Returns the most recent news articles.
     * Number of results is limited by pageable parameter.
     */
    @Query("SELECT n FROM New n ORDER BY n.createdAt DESC")
    List<New> findLatestNews(Pageable pageable);

    /**
     * Finds news articles that contain an exact URL in their links.
     * Example: Finding all news articles that reference a specific website.
     */
    @Query("SELECT n FROM New n WHERE :url MEMBER OF n.links")
    List<New> findByLink(@Param("url") String url);

    /**
     * Finds news articles with links containing a specific domain.
     * Example: Finding all news articles with links to "nature.com".
     */
    @Query("SELECT n FROM New n WHERE LOWER(n.links) LIKE LOWER(CONCAT('%', :domain, '%'))")
    List<New> findByLinkDomain(@Param("domain") String domain);

    /**
     * Full text search across title and authors.
     * Most comprehensive search method.
     * Example: Searching for "climate" would find it in title or authors.
     */
    @Query("SELECT DISTINCT n FROM New n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :term, '%')) OR LOWER(n.authors) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<New> searchEverywhere(@Param("term") String term);

    /**
     * Counts news articles with more than X authors.
     * Useful for finding collaborative news articles.
     */
    @Query("SELECT COUNT(n) FROM New n WHERE SIZE(n.authors) > :authorCount")
    Long countNewsWithMoreThanXAuthors(@Param("authorCount") int authorCount);

    /**
     * Counts news articles that have at least one external link.
     * Useful for statistics about external references.
     */
    @Query("SELECT COUNT(n) FROM New n WHERE SIZE(n.links) > 0")
    Long countNewsWithLinks();

    /**
     * Paginated search in title.
     * Useful for showing results in pages when searching through title.
     */
    @Query("SELECT n FROM New n WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<New> findByKeywordInTitle(@Param("keyword") String keyword, Pageable pageable);
}
