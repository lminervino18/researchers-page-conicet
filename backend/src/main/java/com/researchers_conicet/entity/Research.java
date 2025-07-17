package com.researchers_conicet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import jakarta.validation.constraints.AssertTrue;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a research paper or publication.
 * Maps to the 'researches' table in the database.
 * Contains all information about a research paper, including optional PDF file and required relationships.
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

    /**
     * The research abstract text.
     * Required field stored as TEXT in database.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String researchAbstract;

    /**
     * MIME type of the PDF file.
     * Optional field that must be 'application/pdf' if present.
     */
    @Pattern(regexp = "application/pdf", message = "Only PDF files are allowed")
    @Column(name = "mime_type", nullable = true)
    private String mimeType;

    /**
     * Size of the PDF file in bytes.
     * Optional field.
     */
    @Column(name = "pdf_size", nullable = true)
    private Long pdfSize;

    /**
     * Original name of the uploaded PDF file.
     * Optional field with max length of 255 characters.
     */
    @Size(max = 255, message = "File name must be less than 255 characters")
    @Column(name = "pdf_name", nullable = true)
    private String pdfName;

    /**
     * Storage path of the PDF file.
     * Optional field indicating where the file is stored in the system.
     */
    @Column(name = "pdf_path", nullable = true)
    private String pdfPath;

    /**
     * Timestamp of when the research was created.
     * Automatically set and non-updatable.
     */
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    /**
     * Collection of author names for this research.
     * Required field stored as strings in a separate table.
     * At least one author is required.
     */
    @ElementCollection
    @CollectionTable(
        name = "research_authors",
        joinColumns = @JoinColumn(name = "research_id")
    )
    @Column(name = "author_name", nullable = false)
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of research-related links.
     * Optional field stored as strings in a separate table.
     * Required if no PDF file is provided.
     * URL validation is handled in the service layer.
     */
    @ElementCollection
    @CollectionTable(
        name = "research_links",
        joinColumns = @JoinColumn(name = "research_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();
    
    public Research() {
        createdAt = LocalDateTime.now();
    }

    public Research(String researchAbstract, Set<String> authors, Set<String> links, String pdfName, Long pdfSize, String mimeType, String pdfPath) {
        this.researchAbstract = researchAbstract;
        this.authors = authors != null ? authors : new HashSet<>();
        this.links = links != null ? links : new HashSet<>();
        this.createdAt = LocalDateTime.now();
        this.pdfName = pdfName;
        this.pdfSize = pdfSize;
        this.mimeType = mimeType;
        this.pdfPath = pdfPath;
    }

    /**
     * Validates that the research has either a PDF file or at least one link.
     * This ensures that each research has at least one accessible resource.
     * 
     * @return true if the research has either a PDF or links, false otherwise
     */
    @AssertTrue(message = "Either a PDF file or at least one link is required")
    private boolean isValidResource() {
        boolean hasPdf = pdfPath != null && !pdfPath.trim().isEmpty();
        boolean hasLinks = links != null && !links.isEmpty();
        return hasPdf || hasLinks;
    }
}