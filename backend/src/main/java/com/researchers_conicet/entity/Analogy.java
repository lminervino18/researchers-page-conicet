package com.researchers_conicet.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing an analogy publication.
 * This class maps to the 'analogies' table in the database and contains
 * all information about an analogy box, including its relationships.
 */
@Entity
@Data
@Table(
    name = "analogies",
    indexes = {
        @Index(name = "idx_analogy_created_at", columnList = "created_at")
    }
)
public class Analogy {
    
    /**
     * Unique identifier for the analogy.
     * Auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Detailed content of the analogy.
     * Stored as a text column to allow longer descriptions.
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Title of the analogy.
     * Required field, cannot be null.
     */
    @Column(nullable = false)
    private String title;

    /**
     * Timestamp of analogy creation.
     * Cannot be updated after initial creation.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Collection of author names for this analogy.
     * Stored as simple strings in a separate table.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "analogy_authors",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    @Column(name = "author_name")
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of analogy-related links.
     * Stored as simple strings in a separate table.
     * URL validation is handled in the frontend.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "analogy_links",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();


    /**
     * Collection of Firebase media links (images or videos) related to this analogy.
     * Stored as embeddable objects with media type and URL.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "analogy_media_links",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    private Set<MediaLink> mediaLinks = new HashSet<>();


    /**
     * Collection of emails that have supported this analogy.
     * Prevents multiple supports from the same email.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "analogy_supports",
        joinColumns = @JoinColumn(name = "analogy_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"analogy_id", "support_email"})
    )
    @Column(name = "support_email")
    private Set<String> supportEmails = new HashSet<>();

    
    /**
     * Adds a support email to the analogy.
     * @param email The email to add to supports
     * @return true if the email was added, false if it was already present
     */
    public boolean addSupportEmail(String email) {
        return supportEmails.add(email);
    }
    
    /**
     * Removes a support email from the analogy.
     * @param email The email to remove from supports
     * @return true if the email was removed, false if it was not present
     */
    public boolean removeSupportEmail(String email) {
        return supportEmails.remove(email);
    }

    @Transient
    private int supportCount;
    
    public Analogy() {
        createdAt = LocalDateTime.now();
    }

    public Analogy(String title, String content, Set<String> authors, Set<String> links, Set<String> supportEmails) {
        this.content = content;
        this.title = title;
        this.authors = authors != null ? authors : new HashSet<>();
        this.links = links != null ? links : new HashSet<>();
        this.supportEmails = supportEmails != null ? supportEmails : new HashSet<>();
        this.supportCount = supportEmails != null ? supportEmails.size() : 0;
        this.createdAt = LocalDateTime.now();
    }

    /*
     * Deep copy constructor for cloning comments
     * WARNING: This does not create a new row in database, it only clones the object in memory.
     * @param comment The comment to clone
     */
    public Analogy(Analogy analogy) {
        this.id = analogy.id;
        this.content = analogy.content;
        this.title = analogy.title;
        this.createdAt = analogy.createdAt;
        this.authors = new HashSet<>(analogy.authors);
        this.links = new HashSet<>(analogy.links);
        this.supportEmails = new HashSet<>(analogy.supportEmails);
        this.supportCount = analogy.supportCount;
    }
}