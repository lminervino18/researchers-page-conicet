// FileStorageServiceTest.java
package com.researchers_conicet.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    void storeFile_shouldStoreValidPdf() throws IOException {
        byte[] content = "dummy pdf content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                content
        );

        String fileName = fileStorageService.storeFile(file);

        Path storedFile = tempDir.resolve(fileName);
        assertThat(Files.exists(storedFile)).isTrue();
        assertThat(Files.readAllBytes(storedFile)).isEqualTo(content);
    }

    @Test
    void storeFile_shouldRejectInvalidType() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "invalid".getBytes()
        );

        assertThatThrownBy(() -> fileStorageService.storeFile(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only PDF files are allowed");
    }

    @Test
    void storeFile_shouldRejectLargeFile() {
        byte[] largeContent = new byte[26 * 1024 * 1024]; // 26MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeContent
        );

        assertThatThrownBy(() -> fileStorageService.storeFile(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File size cannot exceed");
    }

    @Test
    void loadFileAsResource_shouldReturnFile() throws IOException {
        String fileName = "sample.pdf";
        Path filePath = tempDir.resolve(fileName);
        Files.write(filePath, "pdf content".getBytes());

        Resource resource = fileStorageService.loadFileAsResource(fileName);

        assertThat(resource.exists()).isTrue();
        assertThat(resource.getFilename()).isEqualTo(fileName);
    }

    @Test
    void loadFileAsResource_shouldThrowIfNotFound() {
        assertThatThrownBy(() -> fileStorageService.loadFileAsResource("missing.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("File not found");
    }

    @Test
    void deleteFile_shouldRemoveExistingFile() throws IOException {
        String fileName = "toDelete.pdf";
        Path filePath = tempDir.resolve(fileName);
        Files.write(filePath, "delete me".getBytes());

        fileStorageService.deleteFile(fileName);

        assertThat(Files.exists(filePath)).isFalse();
    }

    @Test
    void deleteFile_shouldThrowIfNotFound() {
        assertThatThrownBy(() -> fileStorageService.deleteFile("missing.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("File not found");
    }
}
