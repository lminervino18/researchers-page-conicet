package com.researchers_conicet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Entity representing a comment from an analogy publication.
 * This class maps to the 'comments' table in the database and contains
 * all information about an analogy box, including it's relationships.
 */
@Entity
@Data
@Table(
    name = "comments",
    indexes = {
        @Index(name = "idx_comment_created_at", columnList = "created_at"),
        @Index(name = "idx_comment_email", columnList = "email")
    }
)
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "email", nullable = false)
    @Email(message = "Invalid email format")
    private String email;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 🔸 Self-referencing relationship: many comments can respond to the same parent comment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", foreignKey = @ForeignKey(name = "fk_parent_comment")) 
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Comment parent;

    // 🔸 Referencing to analogy relationship: many comments can be included in the same analogy
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analogy_id", nullable = false, foreignKey = @ForeignKey(name = "fk_commented_analogy"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Analogy analogy;

    /**
     * Collection of emails that have supported this comment.
     * Prevents multiple supports from the same email.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "comment_supports",
        joinColumns = @JoinColumn(name = "comment_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"comment_id", "email"})
    )
    @Column(name = "support_email")
    private Set<String> supportEmails = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Comment() {}

    /**
     * 
     * @param content
     * @param userName
     * @param email
     * @param parent
     * @param analogy
     */
    public Comment(String userName, String content, String email, Optional<Comment> parent, Analogy analogy) {
        this.content = content;
        this.userName = userName;
        this.email = email;
        this.analogy = analogy;
        parent.ifPresent(this::setParent);
    }

    /**
     * Adds a support email to the comment.
     * @param email The email to add to supports
     * @return true if the email was added, false if it was already present
     */
    public boolean addSupportEmail(String email) {
        return supportEmails.add(email);
    }

    /**
     * Removes a support email from the comment.
     * @param email The email to remove from supports
     * @return true if the email was removed, false if it was not present
     */
    public boolean removeSupportEmail(String email) {
        return supportEmails.remove(email);
    }
}