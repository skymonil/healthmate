package com.healthmate.service;

import com.healthmate.model.DiagnosisReport;
import com.healthmate.repository.DiagnosisReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiagnosisReportService {

    private final DiagnosisReportRepository reportRepository;

    public DiagnosisReportService(DiagnosisReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public DiagnosisReport save(DiagnosisReport report) {
        return reportRepository.save(report);
    }

    public List<DiagnosisReport> getReportsByUserId(String userId) {
        return reportRepository.findByUserId(userId);
    }

    public Optional<DiagnosisReport> getReportById(String reportId) {
        return reportRepository.findById(reportId);
    }

    public boolean deleteReportById(String reportId) {
        Optional<DiagnosisReport> report = reportRepository.findById(reportId);
        if (report.isPresent()) {
            reportRepository.deleteById(reportId);
            return true;
        }
        return false;
    }
}
