package com.researchers_conicet.repository;

import com.researchers_conicet.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Comment entity.
 * Extends JpaRepository to inherit basic CRUD operations.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Returns a comment by its ID and by its specific analogy ID.
     *
     * @param id the ID of the comment
     * @param analogyId the ID of the analogy
     * @return the comment belonging to the specified ID and analogy ID
	 * @throws IllegalArgumentException if {@literal id} is {@literal null}.
     */
    Optional<Comment> findByIdAndAnalogyId(Long id, Long analogyId);
    
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
}