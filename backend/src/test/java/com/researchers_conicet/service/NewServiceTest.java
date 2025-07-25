package com.researchers_conicet.service;

import com.researchers_conicet.entity.New;
import com.researchers_conicet.dto.news.NewsRequestDTO;
import com.researchers_conicet.dto.news.NewsResponseDTO;
import com.researchers_conicet.dto.media_link.MediaLinkDTO;
import com.researchers_conicet.repository.NewRepository;
import com.researchers_conicet.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NewServiceTest {

    @Mock
    private NewRepository repository;

    @InjectMocks
    private NewService service;

    @Test
    void createNew_shouldReturnCreatedNewsResponse() {
        // Create NewsRequestDTO for news
        NewsRequestDTO requestDto = new NewsRequestDTO();
        requestDto.setTitle("News Title");
        requestDto.setContent("News Content");
        requestDto.setAuthors(new HashSet<>(Arrays.asList("Author 1", "Author 2")));
        requestDto.setLinks(new HashSet<>(Arrays.asList("https://example.com")));
        
        // Create MediaLinkDTO
        MediaLinkDTO mediaLinkDTO = new MediaLinkDTO();
        mediaLinkDTO.setUrl("https://media.com");
        mediaLinkDTO.setMediaType("image");

        // Set mediaLinks to ensure it's not null
        requestDto.setMediaLinks(new HashSet<>(Arrays.asList(mediaLinkDTO)));

        // Mock repository.save
        Long id = 1L;
        when(repository.save(ArgumentMatchers.any(New.class))).thenAnswer(invocation -> {
            New arg = invocation.getArgument(0);
            arg.setId(id);
            return arg;
        });

        NewsResponseDTO result = service.createNew(requestDto);

        // Assert the returned DTO is not null
        assertThat(result).isNotNull();

        // Expected Response DTO
        NewsResponseDTO responseDto = new NewsResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle("News Title");
        responseDto.setContent("News Content");
        responseDto.setAuthors(new HashSet<>(Arrays.asList("Author 1", "Author 2")));
        responseDto.setLinks(new HashSet<>(Arrays.asList("https://example.com")));
        responseDto.setMediaLinks(new HashSet<>(Arrays.asList(mediaLinkDTO)));
        responseDto.setCreatedAt(result.getCreatedAt());

        // Assert result equals expected response
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void createNew_shouldThrowException_whenTitleIsEmpty() {
        NewsRequestDTO requestDto = new NewsRequestDTO();
        requestDto.setTitle(""); // Empty title
        requestDto.setContent("News Content");
        requestDto.setAuthors(new HashSet<>(Arrays.asList("Author 1")));
        requestDto.setLinks(new HashSet<>(Arrays.asList("https://example.com")));
        requestDto.setMediaLinks(new HashSet<>()); // Ensuring mediaLinks is not null

        // Assert that createNew throws IllegalArgumentException due to empty title
        assertThrows(IllegalArgumentException.class, () -> service.createNew(requestDto));
    }

    @Test
    void getNew_shouldReturnExistingNewsResponse() {
        Long id = 1L;

        New news = new New();
        news.setId(id);
        news.setTitle("News Title");
        news.setContent("News Content");
        news.setAuthors(new HashSet<>(Arrays.asList("Author 1", "Author 2")));
        news.setLinks(new HashSet<>(Arrays.asList("https://example.com")));
        news.setMediaLinks(new HashSet<>()); // Ensuring mediaLinks is not null

        when(repository.findById(id)).thenReturn(Optional.of(news));

        NewsResponseDTO result = service.getNew(id);

        // Expected Response DTO
        NewsResponseDTO responseDto = new NewsResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle(news.getTitle());
        responseDto.setContent(news.getContent());
        responseDto.setAuthors(news.getAuthors());
        responseDto.setLinks(news.getLinks());
        // Convert Set<MediaLink> to Set<MediaLinkDTO>
        Set<MediaLinkDTO> mediaLinkDTOs = new HashSet<>();
        if (news.getMediaLinks() != null) {
            for (var mediaLink : news.getMediaLinks()) {
                MediaLinkDTO dto = new MediaLinkDTO();
                dto.setUrl(mediaLink.getUrl());
                dto.setMediaType(mediaLink.getMediaType());
                mediaLinkDTOs.add(dto);
            }
        }
        responseDto.setMediaLinks(mediaLinkDTOs);
        responseDto.setCreatedAt(news.getCreatedAt());

        // Assert that the result is not null and equals the expected response
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);

        // Test for non-existing news should throw ResourceNotFoundException
        when(repository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getNew(2L));
    }

    @Test
    void updateNew_shouldReturnUpdatedNewsResponse() {
        Long id = 1L;

        // Create Request DTO for updating news
        NewsRequestDTO requestDto = new NewsRequestDTO();
        requestDto.setTitle("Updated News Title");
        requestDto.setContent("Updated News Content");
        requestDto.setAuthors(new HashSet<>(Arrays.asList("New Author 1", "New Author 2")));
        requestDto.setLinks(new HashSet<>(Arrays.asList("https://newexample.com")));
        requestDto.setMediaLinks(new HashSet<>()); // Ensuring mediaLinks is not null

        New news = new New();
        news.setId(id);
        news.setTitle("News Title");
        news.setContent("News Content");
        news.setAuthors(new HashSet<>(Arrays.asList("Author 1", "Author 2")));
        news.setLinks(new HashSet<>(Arrays.asList("https://example.com")));
        news.setMediaLinks(new HashSet<>()); // Ensuring mediaLinks is not null

        when(repository.findById(id)).thenReturn(Optional.of(news));
        when(repository.save(ArgumentMatchers.any(New.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NewsResponseDTO result = service.updateNew(id, requestDto);

        // Expected Response DTO
        NewsResponseDTO responseDto = new NewsResponseDTO();
        responseDto.setId(id);
        responseDto.setTitle(requestDto.getTitle());
        responseDto.setContent(requestDto.getContent());
        responseDto.setAuthors(requestDto.getAuthors());
        responseDto.setLinks(requestDto.getLinks());
        responseDto.setMediaLinks(requestDto.getMediaLinks());
        responseDto.setCreatedAt(news.getCreatedAt());

        // Assert that the result equals the expected response
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(responseDto);
    }

    @Test
    void deleteNew_shouldDeleteExistingNews() {
        Long id = 1L;

        New news = new New();
        news.setId(id);

        when(repository.findById(id)).thenReturn(Optional.of(news));

        // Test delete operation
        service.deleteNew(id);

        // Verify repository delete is called
        assertThrows(ResourceNotFoundException.class, () -> service.getNew(id));
    }

    @Test
    void searchByTitle_shouldReturnAListOfNewsWithTextInTitle() {
        String text = "Test";

        New news1 = new New("Test News Title 1", "Test Content 1", new HashSet<>(Arrays.asList("Author 1")), new HashSet<>(Arrays.asList("https://link.com")), new HashSet<>());
        New news2 = new New("Test News Title 2", "Test Content 2", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://link.com")), new HashSet<>());

        List<New> newsList = Arrays.asList(news1, news2);

        when(repository.findByTitleContainingIgnoreCase(text)).thenReturn(newsList);

        List<NewsResponseDTO> result = service.searchByTitle(text);

        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.get(0).getTitle()).contains(text);
    }


    @Test
    void searchEverywhere_shouldReturnAListOfNewsWithTextAnywhere() {
        String text = "Test";
        List<New> newsList = Arrays.asList(
            new New("Test News Title", "Content with Test", new HashSet<>(Arrays.asList("Author 1")), new HashSet<>(Arrays.asList("https://link.com")), new HashSet<>()),
            new New("Real News Title", "Content without search term", new HashSet<>(Arrays.asList("Author 2")), new HashSet<>(Arrays.asList("https://link.com")), new HashSet<>())
        );

        when(repository.searchEverywhere(text)).thenReturn(newsList);

        List<NewsResponseDTO> result = service.searchEverywhere(text);

        // Assert the result is not null and the correct data is returned
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getTitle()).contains("Test");
    }
}
