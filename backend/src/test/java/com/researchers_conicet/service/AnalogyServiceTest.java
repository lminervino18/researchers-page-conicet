package com.researchers_conicet.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.researchers_conicet.dto.analogy.AnalogyRequestDTO;
import com.researchers_conicet.dto.analogy.AnalogyResponseDTO;
import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.repository.AnalogyRepository;

@ExtendWith(MockitoExtension.class)
class AnalogyServiceTest {

    @Mock
    private AnalogyRepository repository;

    @Mock
    private EmailVerificationService emailService;

    @InjectMocks
    private AnalogyService service;

    @Test
    void createAnalogy_shouldReturnCreatedAnalogyResponse() {
        // Creates Request DTO for analogy
        AnalogyRequestDTO requestDto = new AnalogyRequestDTO();
        requestDto.setTitle("Title");
        requestDto.setContent("Content");
        requestDto.setAuthors(new HashSet<String>(Arrays.asList("Author 1", "Author 2")));
        requestDto.setLinks(new HashSet<String>(Arrays.asList(("https://example"))));
        
        // Mock repository.save retreive
        Long id = 1L;
        when(repository.save(ArgumentMatchers.any(Analogy.class))).thenAnswer(invocation -> {
            Analogy arg = invocation.getArgument(0);
            arg.setId(id);
            arg.setSupportCount(0);
            return arg;
        });

        AnalogyResponseDTO result = service.createAnalogy(requestDto);

        // Assert that the returned DTO is not null
        assertThat(result).isNotNull();

        // Create expected Response DTO 
        AnalogyResponseDTO responseDto = new AnalogyResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle("Title");
        responseDto.setContent("Content");
        responseDto.setAuthors(new HashSet<String>(Arrays.asList("Author 1", "Author 2")));
        responseDto.setLinks(new HashSet<String>(Arrays.asList(("https://example"))));
        responseDto.setCreatedAt(result.getCreatedAt());
        responseDto.setSupportCount(0);

        // Assert result is the expected response
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void createAnalogy_shouldThrowException_whenTitleIsEmpty() {
        AnalogyRequestDTO requestDto = new AnalogyRequestDTO();
        requestDto.setTitle(""); // Title vacío
        requestDto.setContent("Content");
        requestDto.setAuthors(new HashSet<>(Arrays.asList("Author 1")));
        requestDto.setLinks(new HashSet<>(Arrays.asList("https://example")));

        // Assert AnalogyService.createAnalogy to throw IllegalArgumentException with empty title
        assertThrows(IllegalArgumentException.class, () -> service.createAnalogy(requestDto));
    }

    @Test
    void getAnalogy_shouldReturnExistingAnalogyResponse() {
        Long id = 1L;

        Analogy analogy = new Analogy("Title", "Content", new HashSet<>(Arrays.asList("Author 1", "Author 2")), new HashSet<>(Arrays.asList("https://example")), null);
        analogy.setId(id);

        when(repository.findById(id)).thenReturn(Optional.of(analogy));

        AnalogyResponseDTO result = service.getAnalogy(id);

        // Create expected Response DTO 
        AnalogyResponseDTO responseDto = new AnalogyResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle(analogy.getTitle());
        responseDto.setContent(analogy.getContent());
        responseDto.setAuthors(analogy.getAuthors());
        responseDto.setLinks(analogy.getLinks());
        responseDto.setCreatedAt(analogy.getCreatedAt());
        responseDto.setSupportCount(0);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);

        // Trying to get a non existing analogy should throw a ResourceNotFoundException
        when(repository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getAnalogy(2L));
    }

    @Test
    void updateAnalogy_shouldReturnUpdatedAnalogyResponse() {
        Long id = 1L;

        // Creates Request DTO for analogy
        AnalogyRequestDTO requestDto = new AnalogyRequestDTO();
        requestDto.setTitle("Updated Title");
        requestDto.setContent("Updated Content");
        requestDto.setAuthors(new HashSet<String>(Arrays.asList("New Author 1", "New Author 2")));
        requestDto.setLinks(new HashSet<String>(Arrays.asList(("https://newexample"))));

        Analogy analogy = new Analogy("Title", "Content", new HashSet<>(Arrays.asList("Author 1", "Author 2")), new HashSet<>(Arrays.asList("https://example")), null);
        analogy.setId(id);

        when(repository.findById(analogy.getId())).thenReturn(Optional.of(analogy));

        when(repository.save(ArgumentMatchers.any(Analogy.class))).thenAnswer(invocation -> {
            Analogy arg = invocation.getArgument(0);
            return arg;
        });

        // Create expected Response DTO 
        AnalogyResponseDTO responseDto = new AnalogyResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle(requestDto.getTitle());
        responseDto.setContent(requestDto.getContent());
        responseDto.setAuthors(requestDto.getAuthors());
        responseDto.setLinks(requestDto.getLinks());
        responseDto.setCreatedAt(analogy.getCreatedAt());
        responseDto.setSupportCount(analogy.getSupportCount());

        AnalogyResponseDTO result = service.updateAnalogy(id, requestDto);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void searchByTitle_shouldReturnAListOfAnologiesWithTextInTitle() {
        String text = "Test";
        List<Analogy> analogies = Arrays.asList(
            new Analogy("This is a Test analogy", "Content 1", new HashSet<>(Arrays.asList("Author 1")), new HashSet<>(Arrays.asList("https://example")), null),
            new Analogy("This is a real analogy", "Content 2", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://example")), null),
            new Analogy("This is another test analogy", "Content 2", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://example")), null)
        );

        when(repository.findByTitleContainingIgnoreCase(text)).thenAnswer(invocation -> {
            String param = invocation.getArgument(0);
            if (param.equals(text)) {
                return Arrays.asList(analogies.get(0), analogies.get(2));
            }
            return Arrays.asList();
        });

        List<AnalogyResponseDTO> expected = new ArrayList<>();
        for (int idx : new int[]{0, 2}) {
            Analogy analogy = analogies.get(idx);
            AnalogyResponseDTO dto = new AnalogyResponseDTO();
            dto.setId(analogy.getId());
            dto.setTitle(analogy.getTitle());
            dto.setContent(analogy.getContent());
            dto.setAuthors(analogy.getAuthors());
            dto.setLinks(analogy.getLinks());
            dto.setCreatedAt(analogy.getCreatedAt());
            dto.setSupportCount(analogy.getSupportCount());
            expected.add(dto);
        }

        List<AnalogyResponseDTO> result = service.searchByTitle(text);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expected);

        assertThrows(IllegalArgumentException.class, () -> service.searchByTitle(""));
    }

    @Test
    void searchEverywhere_shouldReturnAListOfAnalogiesWithTextAnywhere() {
        String text = "Test";
        List<Analogy> analogies = Arrays.asList(
            new Analogy("This is a Test analogy", "Content 1", new HashSet<>(Arrays.asList("Author 1")), new HashSet<>(Arrays.asList("https://example")), null),
            new Analogy("This is a real analogy", "Content 2", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://example")), null),
            new Analogy("This is another analogy", "This analogy also includes the word 'test', but in its content", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://example")), null)
        );

        when(repository.searchEverywhere(text)).thenAnswer(invocation -> {
            String param = invocation.getArgument(0);
            if (param.equals(text)) {
                return Arrays.asList(analogies.get(0), analogies.get(2));
            }
            return Arrays.asList();
        });

        List<AnalogyResponseDTO> expected = new ArrayList<>();
        for (int idx : new int[]{0, 2}) {
            Analogy analogy = analogies.get(idx);
            AnalogyResponseDTO dto = new AnalogyResponseDTO();
            dto.setId(analogy.getId());
            dto.setTitle(analogy.getTitle());
            dto.setContent(analogy.getContent());
            dto.setAuthors(analogy.getAuthors());
            dto.setLinks(analogy.getLinks());
            dto.setCreatedAt(analogy.getCreatedAt());
            dto.setSupportCount(analogy.getSupportCount());
            expected.add(dto);
        }

        List<AnalogyResponseDTO> result = service.searchEverywhere(text);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expected);

        assertThrows(IllegalArgumentException.class, () -> service.searchByTitle(""));
    }

    @Test
    void addSupport_shouldAddNewSupportEmailToAnalogy() {
        Long id = 1L;
        String email = "isexample@gmail.com";

        when(emailService.isEmailRegistered(email)).thenReturn(true);

        Analogy analogy = new Analogy("Title", "Content", new HashSet<>(Arrays.asList("Author 1", "Author 2")), new HashSet<>(Arrays.asList("https://example")), null);
        analogy.setId(id);

        when(repository.findById(id)).thenReturn(Optional.of(analogy));

        AnalogyResponseDTO result = service.addSupport(id, email);

        // Assert if the email was added as a support email
        assertThat(result).isNotNull();
        assertThat(result.getSupportCount()).isEqualTo(1);
    }

    @Test
    void removeSupport_shouldRemoveExistingSupportEmailToAnalogy() {
        Long id = 1L;
        String email = "isexample@gmail.com";

        // when(emailService.isEmailRegistered(email)).thenReturn(true);

        Analogy analogy = new Analogy("Title", "Content", new HashSet<>(Arrays.asList("Author 1", "Author 2")), new HashSet<>(Arrays.asList("https://example")), new HashSet<String>(Arrays.asList(email)));

        when(repository.findById(id)).thenReturn(Optional.of(analogy));

        AnalogyResponseDTO result = service.removeSupport(id, email);

        assertThat(result).isNotNull();
        assertThat(result.getSupportCount()).isEqualTo(0);
    }
}
