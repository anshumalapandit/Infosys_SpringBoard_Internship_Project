package com.disaster.management.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseSchemaFix implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DEBUG: Running manual schema fix to allow NULL disaster_id in rescue_tasks table...");
        try {
            // Force the column to be nullable
            jdbcTemplate.execute("ALTER TABLE rescue_tasks ALTER COLUMN disaster_id DROP NOT NULL");
            System.out.println("DEBUG: Successfully altered rescue_tasks table.");
        } catch (Exception e) {
            System.out.println("DEBUG: Schema fix skipped or failed (might already be fixed): " + e.getMessage());
        }
    }
}
