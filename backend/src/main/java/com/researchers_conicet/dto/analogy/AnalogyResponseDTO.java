package com.researchers_conicet.dto.analogy;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Data Transfer Object for returning analogy information.
 * Includes all fields needed for frontend display.
 */
@Data
public class AnalogyResponseDTO {
    /**
     * Unique identifier for the analogy.
     */
    private Long id;

    /**
     * Title of the analogy.
     */
    private String title;

    /**
     * Detailed content of the analogy.
     */
    private String content;
    
    /**
     * Timestamp of analogy creation.
     */
    private LocalDateTime createdAt;
    
    /**
     * Collection of authors associated with the analogy.
     */
    private Set<String> authors;

    /**
     * Collection of links related to the analogy.
     */
    private Set<String> links;

    /**
     * Number of supports (likes) for the analogy.
     */
    private Integer supportCount = 0;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AnalogyResponseDTO that = (AnalogyResponseDTO) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        if (title != null ? !title.equals(that.title) : that.title != null) return false;
        if (content != null ? !content.equals(that.content) : that.content != null) return false;
        if (createdAt != null ? !createdAt.equals(that.createdAt) : that.createdAt != null) return false;
        if (authors != null ? !authors.equals(that.authors) : that.authors != null) return false;
        if (links != null ? !links.equals(that.links) : that.links != null) return false;
        return supportCount != null ? supportCount.equals(that.supportCount) : that.supportCount == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (title != null ? title.hashCode() : 0);
        result = 31 * result + (content != null ? content.hashCode() : 0);
        result = 31 * result + (createdAt != null ? createdAt.hashCode() : 0);
        result = 31 * result + (authors != null ? authors.hashCode() : 0);
        result = 31 * result + (links != null ? links.hashCode() : 0);
        result = 31 * result + (supportCount != null ? supportCount.hashCode() : 0);
        return result;
    }
}