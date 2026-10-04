package com.foodcoffee.service;

import com.foodcoffee.model.ImageFile;
import com.foodcoffee.repository.ImageFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    @Autowired
    private ImageFileRepository imageFileRepository;

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");

        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence: " + originalFileName);
            }

            // Tạo tên file độc nhất tránh trùng lặp
            String extension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFileName.substring(dotIndex);
            } else {
                extension = ".jpg";
            }
            String newFileName = UUID.randomUUID().toString() + extension;
            byte[] fileBytes = file.getBytes();

            // 1. Lưu vĩnh viễn vào Database PostgreSQL (không bị mất khi restart container Render)
            try {
                ImageFile imageFile = ImageFile.builder()
                        .fileName(newFileName)
                        .originalName(originalFileName)
                        .contentType(file.getContentType() != null ? file.getContentType() : "image/jpeg")
                        .size(file.getSize())
                        .data(fileBytes)
                        .build();
                imageFileRepository.save(imageFile);
            } catch (Exception dbEx) {
                System.err.println("Cảnh báo: Không thể lưu ảnh vào DB, sẽ lưu vào disk: " + dbEx.getMessage());
            }

            // 2. Lưu vào ổ đĩa cục bộ (disk cache cho response nhanh)
            try {
                Path targetLocation = this.fileStorageLocation.resolve(newFileName);
                Files.write(targetLocation, fileBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            } catch (Exception diskEx) {
                System.err.println("Cảnh báo: Không thể ghi cache disk: " + diskEx.getMessage());
            }

            // Trả về đường dẫn truy cập file qua API (/uploads/...)
            return "/uploads/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Optional<ImageFile> getImageFile(String fileName) {
        // 1. Kiểm tra từ Database PostgreSQL
        Optional<ImageFile> fromDb = imageFileRepository.findById(fileName);
        if (fromDb.isPresent()) {
            return fromDb;
        }

        // 2. Fallback: Nếu ảnh có trên ổ đĩa cục bộ mà chưa có trong DB (ví dụ mới mount)
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                byte[] bytes = Files.readAllBytes(filePath);
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "image/jpeg";

                ImageFile newImg = ImageFile.builder()
                        .fileName(fileName)
                        .originalName(fileName)
                        .contentType(contentType)
                        .size((long) bytes.length)
                        .data(bytes)
                        .build();
                try {
                    imageFileRepository.save(newImg);
                } catch (Exception ignored) {}

                return Optional.of(newImg);
            }
        } catch (Exception ignored) {}

        return Optional.empty();
    }

    public boolean imageExists(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) return false;
        try {
            if (imageFileRepository.existsById(fileName)) return true;
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            return Files.exists(filePath);
        } catch (Exception e) {
            return false;
        }
    }
}
