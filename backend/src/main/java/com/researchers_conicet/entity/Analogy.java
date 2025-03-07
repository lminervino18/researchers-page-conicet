package com.researchers_conicet.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a analogy paper or publication.
 * This class maps to the 'analogies' table in the database and contains
 * all information about an analogy box, including it’s relationships.
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
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String title;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Collection of author names for this analogy.
     * Stored as simple strings in a separate table.
     */
    @ElementCollection
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
    @ElementCollection
    @CollectionTable(
        name = "analogy_links",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}