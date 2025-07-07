package com.researchers_conicet.repository;

import com.researchers_conicet.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;



import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Returns a comment by its ID and by its specific analogy ID.
     *
     * @param id the ID of the comment
     * @param analogyId the ID of the analogy
     * @return the comment belonging to the specified ID and analogy ID
     */
    Optional<Comment> findByIdAndAnalogyId(Long id, Long analogyId);
    
    /**
     * Returns a paginated list of comments associated with a specific analogy.
     *
     * @param analogyId the ID of the analogy
     * @param pageable  the pagination information
     * @return a paginated list of comments belonging to the specified analogy
     */
    Page<Comment> findByAnalogyId(Long analogyId, Pageable pageable);

    /**
     * Returns all comments associated with a specific analogy.
     *
     * @param analogyId the ID of the analogy
     * @return a list of comments belonging to the specified analogy
     */
    List<Comment> findByAnalogyId(Long analogyId);
    
    /**
     * Returns all comments for a specific analogy, ordered by creation date ascending.
     *
     * @param analogyId the ID of the analogy
     * @return a list of comments sorted by creation date (oldest first)
     */
    List<Comment> findByAnalogyIdOrderByCreatedAtAsc(Long analogyId);
    
    /**
     * Returns all comments created by a specific user.
     *
     * @param userName the username of the comment creator
     * @return a list of comments created by the specified user
     */
    List<Comment> findByUserName(String userName);
    
    /**
     * Returns all comments created by a specific user within a specific analogy.
     *
     * @param userName  the username of the comment creator
     * @param analogyId the ID of the analogy
     * @return a list of comments matching the user and analogy criteria
     */
    List<Comment> findByUserNameAndAnalogyId(String userName, Long analogyId);
        
    /**
     * Returns the most recent comments for a specific analogy
     * @param pageable number of results limited by it
     */
    @Query("SELECT c FROM Comment c WHERE c.analogy.id = :analogyID ORDER BY c.createdAt DESC")
    List<Comment> findLatestCommentsByAnalogy(Pageable pageable, @Param("analogyID") Long analogyID);
    
    /**
     * Returns all comments that are replies to a specific parent comment.
     *
     * @param parentId the ID of the parent comment
     * @return a list of comments that are replies to the specified comment
     */
    List<Comment> findByParentId(Long parentId);
    
    /**
     * Finds all comments created today within a specific analogy
     * Uses database's current date for comparison
     */
    @Query("SELECT c FROM Comment c WHERE DATE(c.createdAt) = CURRENT_DATE AND c.analogy.id = :analogyID")
    List<Comment> findTodayCommentsByAnalogy(@Param("analogyID") Long analogyID);
    
    /**
     * Returns all comments created within a specific date range.
     *
     * @param startDate the start of the date range
     * @param endDate   the end of the date range
     * @return a list of comments created between the specified dates
     */
    List<Comment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Counts the number of comments associated with a specific analogy.
     *
     * @param analogyId the ID of the analogy
     * @return the number of comments in the specified analogy
     */
    Long countByAnalogyId(Long analogyId);

    /**
     * Returns all comments that contain a specific keyword in their content.
     *
     * @param keyword the keyword to search for within comment content
     * @return a list of comments containing the specified keyword
     */
    List<Comment> findByAnalogyIdAndContentContaining(Long analogyId, String keyword);

    /**
     * Returns all root-level comments (those without a parent) within a specific analogy.
     *
     * @param analogyId the ID of the analogy
     * @return a list of top-level comments in the specified analogy
     */
    List<Comment> findByParentIdIsNullAndAnalogyId(Long analogyId);

    /**
     * Returns all comments that are root-level (do not have a parent comment).
     *
     * @return a list of comments without any parent comment
     */
    List<Comment> findByParentIdIsNull();

    /**
     * Returns all comments that are replies (have a parent comment).
     *
     * @return a list of comments that are child comments of other comments
     */
    List<Comment> findByParentIdIsNotNull();

    /**
     * Checks if an email exists in the database
     *
     * @param email the email to verify
     * @return true if the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Finds comments by email
     *
     * @param email the user's email
     * @return list of comments associated with the email
     */
    List<Comment> findByEmail(String email);

    /**
     * Finds comments by email in a specific analogy
     *
     * @param email the user's email
     * @param analogyId the ID of the analogy
     * @return list of user's comments in the analogy
     */
    List<Comment> findByEmailAndAnalogyId(String email, Long analogyId);

    /**
     * Counts the number of comments by email
     *
     * @param email the user's email
     * @return number of comments made by the email
     */
    Long countByEmail(String email);

    /**
     * Searches for a comment by email and comment ID
     *
     * @param email the user's email
     * @param commentId the ID of the comment
     * @return Optional of the comment if it exists
     */
    Optional<Comment> findByEmailAndId(String email, Long commentId);

    /**
     * Custom query method to verify if an email can comment
     * Can be customized based on specific requirements
     *
     * @param email the email to verify
     * @return true if the email is authorized to comment, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Comment c WHERE c.email = :email")
    boolean isEmailAuthorizedToComment(@Param("email") String email);


    /**
     * Finds comments sorted by support count in descending order
     * Useful for displaying most supported comments
     * @param analogyId The ID of the analogy for which find comments
     */
    @Query("SELECT c FROM Comment c WHERE c.analogy.id = :analogyId ORDER BY SIZE(c.supportEmails) DESC")
    List<Comment> findMostSupportedCommentsByAnalogyId(Pageable pageable, @Param("analogyId") Long analogyId);

    /**
     * Checks if an email has already supported a specific comment
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM Comment c JOIN c.supportEmails email WHERE c.id = :commentId AND email = :emailToCheck")
    boolean hasEmailSupportedAnalogy(
        @Param("commentId") Long commentId, 
        @Param("emailToCheck") String emailToCheck
    );

    /**
     * Counts the number of unique support emails for a specific comment
     * 
     * @param commentId The ID of the comment
     * @return Number of unique support emails
     */
    @Query("SELECT COUNT(DISTINCT email) FROM Comment c JOIN c.supportEmails email WHERE c.id = :commentId")
    int countSupportsByCommentId(@Param("commentId") Long commentId);

    @Query("SELECT c.id FROM Comment c JOIN c.supportEmails e WHERE e = :email")
    List<Long> findSupportedCommentIdsByEmail(@Param("email") String email);

}