package com.researchers_conicet.repository;

import com.researchers_conicet.entity.Analogy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Analogy entity.
 * Extends JpaRepository to inherit basic CRUD operations and provides custom query methods.
 */
@Repository
public interface AnalogyRepository extends JpaRepository<Analogy, Long> {

    /**
     * Searches in the title text, case insensitive
     * Example: "climate" would find all analogies mentioning climate in their title
     */
    List<Analogy> findByTitleContainingIgnoreCase(String text);

    /**
     * Finds all analogies by an exact author name
     * Example: "John Smith" would find all analogies where "John Smith" is listed as an author
     */
    @Query("SELECT a FROM Analogy a JOIN a.authors author WHERE author = :authorName")
    List<Analogy> findByAuthor(@Param("authorName") String authorName);

    /**
     * Finds analogies where author name contains the given text
     * Example: "Smith" would match "John Smith", "Smith John", etc.
     */
    @Query("SELECT a FROM Analogy a JOIN a.authors author " +
           "WHERE LOWER(author) LIKE LOWER(CONCAT('%', :partialName, '%'))")
    List<Analogy> findByAuthorNameContaining(@Param("partialName") String partialName);

    /**
     * Finds analogies created between two dates
     * Useful for finding analogies from a specific time period
     */
    List<Analogy> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Finds all analogies created today
     * Uses database's current date for comparison
     */
    @Query("SELECT a FROM Analogy a WHERE DATE(a.createdAt) = CURRENT_DATE")
    List<Analogy> findTodayAnalogies();

    /**
     * Returns the most recent analogies
     * Number of results limited by pageable parameter
     */
    @Query("SELECT a FROM Analogy a ORDER BY a.createdAt DESC")
    List<Analogy> findLatestAnalogies(Pageable pageable);

    /**
     * Finds analogies that contain an exact URL in their links
     * Example: Finding all analogies that reference a specific website
     */
    @Query("SELECT a FROM Analogy a JOIN a.links link WHERE link = :url")
    List<Analogy> findByLink(@Param("url") String url);

    /**
     * Finds analogies with links containing a specific domain
     * Example: Finding all analogies with links to "nature.com"
     */
    @Query("SELECT a FROM Analogy a JOIN a.links link " +
           "WHERE LOWER(link) LIKE LOWER(CONCAT('%', :domain, '%'))")
    List<Analogy> findByLinkDomain(@Param("domain") String domain);

    /**
     * Full text search across title and authors
     * Most comprehensive search method
     * Example: Searching for "climate" would find it in title or authors
     */
    @Query("SELECT DISTINCT a FROM Analogy a " +
           "LEFT JOIN a.authors author " +
           "WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(author) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Analogy> searchEverywhere(@Param("term") String term);

    /**
     * Counts analogies with more than X authors
     * Useful for finding collaborative analogy papers
     */
    @Query("SELECT COUNT(a) FROM Analogy a WHERE SIZE(a.authors) > :authorCount")
    Long countAnalogiesWithMoreThanXAuthors(@Param("authorCount") int authorCount);

    /**
     * Counts analogies that have at least one external link
     * Useful for statistics about external references
     */
    @Query("SELECT COUNT(a) FROM Analogy a WHERE SIZE(a.links) > 0")
    Long countAnalogiesWithLinks();

    /**
     * Paginated search in title
     * Useful for showing results in pages when searching through title
     */
    @Query("SELECT a FROM Analogy a " +
           "WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Analogy> findByKeywordInTitle(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Finds analogies sorted by support count in descending order
     * Useful for displaying most supported analogies
     */
    @Query("SELECT a FROM Analogy a ORDER BY SIZE(a.supportEmails) DESC")
    List<Analogy> findMostSupportedAnalogies(Pageable pageable);

    /**
     * Checks if an email has already supported a specific analogy
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
           "FROM Analogy a JOIN a.supportEmails email WHERE a.id = :analogyId AND email = :emailToCheck")
    boolean hasEmailSupportedAnalogy(
        @Param("analogyId") Long analogyId, 
        @Param("emailToCheck") String emailToCheck
    );

    /**
     * Counts the number of unique support emails for a specific analogy
     * 
     * @param analogyId The ID of the analogy
     * @return Number of unique support emails
     */
    @Query("SELECT COUNT(DISTINCT email) FROM Analogy a JOIN a.supportEmails email WHERE a.id = :analogyId")
    int countSupportsByAnalogyId(@Param("analogyId") Long analogyId);
}