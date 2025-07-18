package com.researchers_conicet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;


/**
 * Service for handling file storage operations.
 * Manages PDF file uploads, downloads, and deletions.
 */
@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final String ALLOWED_FILE_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

    /**
     * Initializes the file storage service with the configured upload directory.
     * Creates the directory if it doesn't exist.
     *
     * @param uploadDir Directory path from application.properties
     */
    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Path.of(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory for uploaded files", ex);
        }
    }

    /**
     * Stores a file in the filesystem.
     * Generates a unique filename to prevent collisions.
     *
     * @param file The MultipartFile to store
     * @return The generated filename
     * @throws RuntimeException if file storage fails
     */
    public String storeFile(MultipartFile file) {
        // Validate the file before processing
        validateFile(file);
    
        try {
            // Get the original filename and ensure it's not null or empty
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isBlank()) {
                throw new IllegalArgumentException("Filename cannot be null or empty");
            }
    
            // Clean the filename to prevent path traversal issues
            String cleanedFileName = StringUtils.cleanPath(originalFileName);
            
    
            // Define the target storage location
            Path targetLocation = this.fileStorageLocation.resolve(cleanedFileName);
            
            // Copy the file content to the target location, replacing if it already exists
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
    
            return cleanedFileName;
        } catch (IOException ex) {
            // Handle file storage failure and include the filename in the error message (if available)
            throw new RuntimeException("Failed to store file " + 
                (file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown"), ex);
        }
    }
    

    /**
     * Loads a file as a Resource.
     * Used for file downloads and viewing.
     *
     * @param fileName Name of the file to load
     * @return Resource containing the file
     * @throws RuntimeException if file cannot be loaded
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if(resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }

    /**
     * Deletes a file from the filesystem.
     *
     * @param fileName Name of the file to delete
     * @throws RuntimeException if deletion fails
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            boolean deleted = Files.deleteIfExists(filePath);
            if (!deleted) {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Failed to delete file: " + fileName, ex);
        }
    }

    /**
     * Gets the URL for accessing the file.
     * For development, returns a local URL.
     *
     * @param fileName Name of the file
     * @return URL for accessing the file
     */
    public String getFileUrl(String fileName) {
        return "/api/researches/view/" + fileName;
    }

    /**
     * Validates the uploaded file.
     * Checks file type, size, and name.
     *
     * @param file File to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
    
        if (!ALLOWED_FILE_TYPE.equals(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size cannot exceed 25MB");
        }
    
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }
    
        String fileName = StringUtils.cleanPath(originalFileName);
        if (fileName.contains("..")) {
            throw new IllegalArgumentException("Invalid file path sequence in filename");
        }
    }
    
}