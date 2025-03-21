package com.researchers_conicet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import java.time.LocalDateTime;

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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Comment(String content, String userName, String email, Comment parent, Analogy analogy) {
        this.content = content;
        this.userName = userName;
        this.email = email;
        this.parent = parent;
        this.analogy = analogy;
    }

    // Default constructor
    public Comment() {}
}