package com.foodcoffee.controller;

import com.foodcoffee.model.ImageFile;
import com.foodcoffee.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping(value = {"/uploads/{fileName:.+}", "/api/uploads/{fileName:.+}"})
    public ResponseEntity<byte[]> getImageFile(@PathVariable String fileName) {
        Optional<ImageFile> imageOpt = fileStorageService.getImageFile(fileName);

        if (imageOpt.isPresent()) {
            ImageFile image = imageOpt.get();
            MediaType mediaType = MediaType.IMAGE_JPEG;
            if (image.getContentType() != null) {
                try {
                    mediaType = MediaType.parseMediaType(image.getContentType());
                } catch (Exception ignored) {
                    if (fileName.toLowerCase().endsWith(".png")) {
                        mediaType = MediaType.IMAGE_PNG;
                    } else if (fileName.toLowerCase().endsWith(".webp")) {
                        mediaType = MediaType.parseMediaType("image/webp");
                    }
                }
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                    .contentType(mediaType)
                    .body(image.getData());
        }

        return ResponseEntity.notFound().build();
    }
}
