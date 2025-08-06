package com.healthmate.controller;

import com.healthmate.model.DiagnosisReport;
import com.healthmate.service.DiagnosisReportService;
import com.healthmate.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/diagnosis")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DiagnosisController {

    private final GeminiService geminiService;
    private final DiagnosisReportService reportService;

    public DiagnosisController(GeminiService geminiService, DiagnosisReportService reportService) {
        this.geminiService = geminiService;
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<?> analyzeSymptoms(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String symptoms = request.get("symptoms");

            if (userId == null || symptoms == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "userId and symptoms are required"));
            }

            String diagnosis = geminiService.diagnose(symptoms);

            DiagnosisReport report = new DiagnosisReport();
            report.setUserId(userId);
            report.setSymptoms(symptoms);
            report.setDiagnosis(diagnosis);

            DiagnosisReport savedReport = reportService.save(report);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error while analyzing symptoms"));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getReportsByUser(@RequestParam(required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId query parameter is required"));
        }
        return ResponseEntity.ok(reportService.getReportsByUserId(userId));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportById(@PathVariable String reportId) {
        Optional<DiagnosisReport> report = reportService.getReportById(reportId);
            return report.<ResponseEntity<?>>map(r -> ResponseEntity.ok(r))
                        .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Report not found")));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReportById(@PathVariable String reportId) {
        boolean deleted = reportService.deleteReportById(reportId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "Report not found"));
        }
    }
}
