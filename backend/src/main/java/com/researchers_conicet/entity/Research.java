package com.researchers_conicet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a research paper or publication.
 * This class maps to the 'researches' table in the database and contains
 * all information about a research paper, including its PDF file and relationships.
 */
@Entity
@Data
@Table(
    name = "researches",
    indexes = {
        @Index(name = "idx_research_created_at", columnList = "created_at")
    }
)
public class Research {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String researchAbstract;

    @Pattern(regexp = "application/pdf", message = "Only PDF files are allowed")
    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "pdf_size")
    private Long pdfSize;

    @Size(max = 255, message = "File name must be less than 255 characters")
    @Column(name = "pdf_name")
    private String pdfName;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Collection of author names for this research.
     * Stored as simple strings in a separate table.
     */
    @ElementCollection
    @CollectionTable(
        name = "research_authors",
        joinColumns = @JoinColumn(name = "research_id")
    )
    @Column(name = "author_name")
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of research-related links.
     * Stored as simple strings in a separate table.
     * URL validation is handled in the frontend.
     */
    @ElementCollection
    @CollectionTable(
        name = "research_links",
        joinColumns = @JoinColumn(name = "research_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}