package com.researchers_conicet.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.entity.Research;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.repository.ResearchRepository;

@ExtendWith(MockitoExtension.class)
public class ResearchServiceTest {

    static final String PDF_NAME = "file_example.pdf";
    static final String MIME_TYPE = "application/pdf";
    static final Long PDF_SIZE = 1024L; // 1 KB
    static final String PDF_PATH_ROOT = "uploads/";
    
    @Mock
    private ResearchRepository repository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ResearchService service;

    private Research createMockResearch() {
        Research research = new Research(
            "Abstract",
            new HashSet<>(Arrays.asList("Author 1", "Author 2")),
            new HashSet<>(Arrays.asList("https://example")),
            PDF_NAME,
            PDF_SIZE,
            MIME_TYPE,
            PDF_PATH_ROOT + PDF_NAME
        );
        return research;
    }

    private MultipartFile getMockFile() {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn(PDF_NAME);
        when(mockFile.getContentType()).thenReturn(MIME_TYPE);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getSize()).thenReturn(PDF_SIZE); // 1 KB
        return mockFile;
    }

    @Test
    void createResearch_shouldReturnCreatedResearchResponse() {
        String pdfName = "file_example.pdf";
        String mimeType = "application/pdf";
        Long pdfSize = 1024L; // 1 KB
        String pdfPath = "uploads/" + pdfName;
        // Creates Request DTO for research
        ResearchRequestDTO requestDto = new ResearchRequestDTO();
        requestDto.setResearchAbstract("Abstract");
        requestDto.setAuthors(new HashSet<String>(Arrays.asList("Author 1", "Author 2")));
        requestDto.setLinks(new HashSet<String>(Arrays.asList(("https://example"))));
        
        // Mock repository.save retreive
        Long id = 1L;
        when(repository.save(ArgumentMatchers.any(Research.class))).thenAnswer(invocation -> {
            Research arg = invocation.getArgument(0);
            arg.setId(id);
            return arg;
        });

        // Mock fileStorageService
        when(fileStorageService.storeFile(ArgumentMatchers.any(MultipartFile.class)))
            .thenReturn("https://example.com/file.pdf");
        when(fileStorageService.getFileUrl("https://example.com/file.pdf")).thenReturn(pdfPath);
        
        // Mock the file
        MultipartFile mockFile = getMockFile();

        ResearchResponseDTO result = service.createResearch(requestDto, mockFile);

        // Assert that the returned DTO is not null
        assertThat(result).isNotNull();

        // Create expected Response DTO 
        ResearchResponseDTO responseDto = new ResearchResponseDTO();
        responseDto.setId(id);
        responseDto.setResearchAbstract("Abstract");
        responseDto.setPdfName(pdfName);
        responseDto.setPdfPath(pdfPath);
        responseDto.setPdfSize(pdfSize);
        responseDto.setMimeType(mimeType);
        responseDto.setAuthors(new HashSet<String>(Arrays.asList("Author 1", "Author 2")));
        responseDto.setLinks(new HashSet<String>(Arrays.asList(("https://example"))));
        responseDto.setCreatedAt(result.getCreatedAt());

        // Assert result is the expected response
        assertThat(result).isEqualTo(responseDto);
        // Assert it throws IllegalArgumentException with empty abstract
        requestDto.setResearchAbstract("");
        assertThrows(IllegalArgumentException.class, () -> service.createResearch(requestDto, mockFile));
    }

    @Test
    void getResearch_shouldReturnExistintResearchResponse() {
        Long id = 1L;
        String pdfName = "file_example.pdf";
        String mimeType = "application/pdf";
        Long pdfSize = 1024L; // 1 KB
        String pdfPath = "uploads/" + pdfName;

        Research research = createMockResearch();
        research.setId(id);

        when(repository.findById(id)).thenReturn(Optional.of(research));

        ResearchResponseDTO result = service.getResearch(id);

        // Create expected Response DTO 
        ResearchResponseDTO responseDto = new ResearchResponseDTO();
        responseDto.setId(id);
        responseDto.setResearchAbstract(research.getResearchAbstract());
        responseDto.setPdfName(pdfName);
        responseDto.setPdfPath(pdfPath);
        responseDto.setPdfSize(pdfSize);
        responseDto.setMimeType(mimeType);
        responseDto.setAuthors(research.getAuthors());
        responseDto.setLinks(research.getLinks());
        responseDto.setCreatedAt(research.getCreatedAt());

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);

        // Trying to get a non existing analogy should throw a ResourceNotFoundException
        when(repository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getResearch(2L));
    }

    @Test
    void updateAnalogy_shouldReturnUpdatedAnalogyResponse() {
        Long id = 1L;

        // Creates Request DTO for research
        ResearchRequestDTO requestDto = new ResearchRequestDTO();
        requestDto.setResearchAbstract("Updated Abstract");
        requestDto.setAuthors(new HashSet<String>(Arrays.asList("New Author 1", "New Author 2")));
        requestDto.setLinks(new HashSet<String>(Arrays.asList(("https://newexample"))));

        Research research = createMockResearch();
        research.setId(id);
        MultipartFile mockFile = getMockFile();
        String pdfPath = PDF_PATH_ROOT + mockFile.getOriginalFilename();

        when(repository.findById(research.getId())).thenReturn(Optional.of(research));

        when(repository.save(ArgumentMatchers.any(Research.class))).thenAnswer(invocation -> {
            Research arg = invocation.getArgument(0);
            return arg;
        });

        when(fileStorageService.storeFile(ArgumentMatchers.any(MultipartFile.class)))
            .thenReturn("https://example.com/file.pdf");
        when(fileStorageService.getFileUrl("https://example.com/file.pdf")).thenReturn(pdfPath);

        // Create expected Response DTO 
        ResearchResponseDTO responseDto = new ResearchResponseDTO();
        responseDto.setId(id);
        responseDto.setResearchAbstract(requestDto.getResearchAbstract());
        responseDto.setAuthors(requestDto.getAuthors());
        responseDto.setLinks(requestDto.getLinks());
        responseDto.setPdfName(mockFile.getOriginalFilename());
        responseDto.setPdfSize(mockFile.getSize());
        responseDto.setMimeType(mockFile.getContentType());
        responseDto.setPdfPath(pdfPath);
        responseDto.setCreatedAt(research.getCreatedAt());


        ResearchResponseDTO result = service.updateResearch(id, requestDto, mockFile);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void deleteResearch_shouldDeleteExistingResearch() {
        Long id = 1L;

        Research research = createMockResearch();
        research.setId(id);

        when(repository.findById(id)).thenReturn(Optional.of(research)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.deleteResearch(id));
        assertThrows(ResourceNotFoundException.class, () -> service.deleteResearch(id));
    }

    @Test
    void searchByAbstract_shouldReturnMatchingResearches() {
        String searchTerm = "Abstract";
        Research research1 = createMockResearch();
        research1.setId(1L);
        research1.setResearchAbstract("This is a research abstract containing the term specified.");
        Research research2 = createMockResearch();
        research2.setId(2L);
        research2.setResearchAbstract("This does not contain the term specified.");

        when(repository.findByResearchAbstractContainingIgnoreCase(ArgumentMatchers.any(String.class))).thenAnswer(invocation -> {
            String arg = invocation.getArgument(0);
            List<Research> candidates = Arrays.asList(research1, research2);
            List<Research> matchers = new ArrayList<>();
            if (arg == null || !arg.equals(searchTerm)) {
                return matchers;
            }
            for (Research r : candidates) {
                if (r.getResearchAbstract().toLowerCase().contains(arg.toLowerCase())) {
                    matchers.add(r);
                }
            }
            return matchers;
        });

        var results = service.searchByAbstract(searchTerm);

        assertThat(results).isNotEmpty();
        assertThat(results.size()).isEqualTo(1);
        assertThat(results.get(0).getResearchAbstract().toLowerCase()).contains(searchTerm.toLowerCase());

        assertThrows(IllegalArgumentException.class, () -> service.searchByAbstract(""));
    }
}
