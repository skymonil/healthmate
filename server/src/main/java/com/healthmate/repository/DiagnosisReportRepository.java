package com.healthmate.repository;

import com.healthmate.model.DiagnosisReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DiagnosisReportRepository extends MongoRepository<DiagnosisReport, String> {
    List<DiagnosisReport> findByUserId(String userId);
}
