package com.researchers_conicet.repository;

import com.researchers_conicet.entity.Research;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


/**
 * Repository interface for Research entity.
 * Extends JpaRepository to inherit basic CRUD operations.
 */
@Repository
public interface ResearchRepository extends JpaRepository<Research, Long> {

    /**
     * Searches in the abstract text, case insensitive
     * Example: "climate" would find all researches mentioning climate in their abstract
     */
    List<Research> findByResearchAbstractContainingIgnoreCase(String text);

    /**
     * Finds all researches by an exact author name
     * Example: "John Smith" would find all researches where "John Smith" is listed as an author
     */
    @Query("SELECT r FROM Research r JOIN r.authors author WHERE author = :authorName")
    List<Research> findByAuthor(@Param("authorName") String authorName);

    /**
     * Finds researches where author name contains the given text
     * Example: "Smith" would match "John Smith", "Smith John", etc.
     */
    @Query("SELECT r FROM Research r JOIN r.authors author " +
           "WHERE LOWER(author) LIKE LOWER(CONCAT('%', :partialName, '%'))")
    List<Research> findByAuthorNameContaining(@Param("partialName") String partialName);

    /**
     * Finds researches created between two dates
     * Useful for finding researches from a specific time period
     */
    List<Research> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Finds all researches created today
     * Uses database's current date for comparison
     */
    @Query("SELECT r FROM Research r WHERE DATE(r.createdAt) = CURRENT_DATE")
    List<Research> findTodayResearches();

    /**
     * Returns the most recent researches
     * Number of results limited by pageable parameter
     */
    @Query("SELECT r FROM Research r ORDER BY r.createdAt DESC")
    List<Research> findLatestResearches(Pageable pageable);

    /**
     * Finds researches that contain an exact URL in their links
     * Example: Finding all researches that reference a specific website
     */
    @Query("SELECT r FROM Research r JOIN r.links link WHERE link = :url")
    List<Research> findByLink(@Param("url") String url);

    /**
     * Finds researches with links containing a specific domain
     * Example: Finding all researches with links to "nature.com"
     */
    @Query("SELECT r FROM Research r JOIN r.links link " +
           "WHERE LOWER(link) LIKE LOWER(CONCAT('%', :domain, '%'))")
    List<Research> findByLinkDomain(@Param("domain") String domain);

    /**
     * Full text search across abstract and authors
     * Most comprehensive search method
     * Example: Searching for "climate" would find it in abstract or authors
     */
    @Query("SELECT DISTINCT r FROM Research r " +
           "LEFT JOIN r.authors author " +
           "WHERE LOWER(r.researchAbstract) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(author) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Research> searchEverywhere(@Param("term") String term);

    /**
     * Counts researches with more than X authors
     * Useful for finding collaborative research papers
     */
    @Query("SELECT COUNT(r) FROM Research r WHERE SIZE(r.authors) > :authorCount")
    Long countResearchesWithMoreThanXAuthors(@Param("authorCount") int authorCount);

    /**
     * Counts researches that have at least one external link
     * Useful for statistics about external references
     */
    @Query("SELECT COUNT(r) FROM Research r WHERE SIZE(r.links) > 0")
    Long countResearchesWithLinks();

    /**
     * Paginated search in abstract
     * Useful for showing results in pages when searching through abstracts
     */
    @Query("SELECT r FROM Research r " +
           "WHERE LOWER(r.researchAbstract) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Research> findByKeywordInAbstract(@Param("keyword") String keyword, Pageable pageable);

}