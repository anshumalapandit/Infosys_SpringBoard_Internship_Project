package com.disaster.management.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final String uploadDir = "uploads";
    private static boolean directoryInitialized = false;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            long startTime = System.currentTimeMillis();
            Path root = Paths.get(uploadDir);
            
            if (!directoryInitialized) {
                if (!Files.exists(root)) {
                    Files.createDirectories(root);
                }
                directoryInitialized = true;
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = UUID.randomUUID().toString() + extension;
            Path path = root.resolve(filename).toAbsolutePath();
            
            // Fast transfer
            file.transferTo(path.toFile());
            
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("DEBUG: File upload processed in " + duration + "ms. Path: " + path);

            String fileUrl = "http://localhost:8080/uploads/" + filename;
            return ResponseEntity.ok(Map.of("url", fileUrl));
            
        } catch (IOException e) {
            System.err.println("ERROR: File upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }
}
