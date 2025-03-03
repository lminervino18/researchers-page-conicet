package com.researchers_conicet.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controller for handling file-related operations
 * Provides endpoints for file downloads
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    /**
     * Directory path where files are uploaded
     * Value is injected from application properties
     */
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Handles file download requests
     * @param fileName The name of the file to download
     * @return ResponseEntity containing the file resource if found
     * 
     * This endpoint:
     * 1. Accepts GET requests for files with any extension (:.+)
     * 2. Constructs the full file path using the upload directory
     * 3. Creates a resource from the file path
     * 4. If file exists:
     *    - Sets content type to PDF
     *    - Sets header for inline display in browser
     *    - Returns file content
     * 5. If file not found:
     *    - Returns 404 status
     * 6. If any error occurs:
     *    - Returns 500 status
     */
    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            // Resolve and normalize the complete file path
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            
            // Create a resource from the file path
            Resource resource = new UrlResource(filePath.toUri());

            // Check if file exists and return appropriate response
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}