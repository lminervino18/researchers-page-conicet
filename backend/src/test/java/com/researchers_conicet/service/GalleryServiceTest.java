package com.researchers_conicet.service;

import java.time.LocalDateTime;
import java.util.Arrays;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.researchers_conicet.dto.gallery.GalleryImageDTO;
import com.researchers_conicet.dto.gallery.GalleryUpdateDTO;
import com.researchers_conicet.entity.GalleryImage;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.repository.GalleryRepository;

@ExtendWith(MockitoExtension.class)
public class GalleryServiceTest {

    @Mock
    private GalleryRepository repository;

    @InjectMocks
    private GalleryService service;

    @Test
    void createGalleryImage_shouldReturnCreatedGalleryImage() {
        GalleryImageDTO request = new GalleryImageDTO();
        request.setUrl("example.jpg");
        request.setLegend("Test legend");

        when(repository.save(ArgumentMatchers.any(GalleryImage.class))).thenAnswer(invocation -> {
            GalleryImage arg = invocation.getArgument(0);
            arg.setCreatedAt(LocalDateTime.now());
            return arg;
        });

        GalleryImage result = service.createGalleryImage(request);
        assertThat(result.getUrl()).isEqualTo("example.jpg");
        assertThat(result.getLegend()).isEqualTo("Test legend");
        assertThat(result.getCreatedAt()).isInstanceOf(LocalDateTime.class);
    }

    @Test
    void updateGalleryImage_shouldReturnUpdatedGalleryImage() {
        String url = "example.jpg";
        GalleryUpdateDTO update = new GalleryUpdateDTO();
        update.setLegend("Updated legend");

        GalleryImage existingImage = new GalleryImage(url, "Old legend");

        when(repository.findById(url)).thenReturn(Optional.of(existingImage));
        when(repository.save(ArgumentMatchers.any(GalleryImage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GalleryImage result = service.updateGalleryImage(url, update);
        assertThat(result.getUrl()).isEqualTo(url);
        assertThat(result.getLegend()).isEqualTo("Updated legend");
    }

    @Test
    void updateGalleryImage_shouldThrowExceptionWhenImageNotFound() {
        String url = "nonexistent.jpg";
        GalleryUpdateDTO update = new GalleryUpdateDTO();
        update.setLegend("Updated legend");

        when(repository.findById(url)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.updateGalleryImage(url, update));
    }

    @Test
    void getGalleryImage_shouldReturnGalleryImage() {
        String url = "example.jpg";
        GalleryImage existingImage = new GalleryImage(url, "Test legend");

        when(repository.findById(url)).thenReturn(Optional.of(existingImage));

        GalleryImage result = service.getGalleryImage(url);
        assertThat(result.getUrl()).isEqualTo(url);
        assertThat(result.getLegend()).isEqualTo("Test legend");
    }

    @Test
    void getGalleryImage_shouldThrowExceptionWhenImageNotFound() {
        String url = "nonexistent.jpg";

        when(repository.findById(url)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getGalleryImage(url));
    }

    @Test
    void getAllImages_shouldReturnAllGalleryImages() {
        GalleryImage image1 = new GalleryImage("image1.jpg", "Legend 1");
        GalleryImage image2 = new GalleryImage("image2.jpg", "Legend 2");

        PageRequest pageable = PageRequest.of(0, 10, Sort.Direction.fromString("DESC"), "createdAt");
        List<GalleryImage> images = Arrays.asList(image1, image2);
        Page<GalleryImage> imagesPage = new org.springframework.data.domain.PageImpl<>(images, pageable, images.size());
        when(repository.findAll(pageable)).thenReturn(imagesPage);

        Page<GalleryImage> page = service.getAllImages(pageable);
        List<GalleryImage> result = page.getContent();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(image1, image2);
    }

    @Test
    void deleteGalleryImage_shouldThrowExceptionWhenImageNotFound() {
        String url = "example.jpg";
        
        when(repository.existsById(url)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> service.deleteGalleryImage(url));
    }
}
