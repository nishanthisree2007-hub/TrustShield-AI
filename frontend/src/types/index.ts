export interface Brand {
  id: number; name: string; alt_names: string[]; official_website: string;
  approved_handles: string[]; logo_hash?: string; logo_url?: string;
  support_channels: string[]; known_keywords: string[]; description?: string;
  created_at: string; updated_at: string;
}
export interface Investigation {
  id: number; title: string; entity_type: string; entity_identifier: string;
  brand_id?: number; risk_score: number; risk_category: string; status: string;
  warning_signals: string[]; contributing_factors: Record<string, number>;
  evidence_summary: Record<string, any>; missing_data: string[];
  confidence_limitations: string[]; recommended_actions: string[];
  analyst_notes: string; is_false_positive: boolean; brand?: Brand;
  resolved_at?: string; created_at: string; updated_at: string;
}
export interface DashboardStats {
  total_investigations: number; impersonation_attempts: number;
  high_risk_findings: number; scam_messages_count: number;
  suspicious_apps_count: number; open_investigations: number;
  resolved_investigations: number; false_positives_count: number;
  brands_monitored: number; potential_campaign_clusters: number;
  risk_distribution: { name: string; value: number; color: string }[];
  entity_types_data: { name: string; count: number }[];
  threat_timeline: { day: string; threats: number; resolved: number }[];
  recent_alerts: any[];
}
export interface ProfileAnalysisResult {
  risk_score: number; risk_category: string; brand_matched?: string;
  similarity_score: number; detected_warning_signals: string[];
  evidence: { type: string; detail: string }[]; missing_information: string[];
  confidence_limitations: string[]; contributing_factors: Record<string, number>;
  recommended_actions: string[]; investigation_id?: number;
}
export interface ScamAnalysisResult {
  scam_category: string; risk_score: number; risk_category: string;
  detected_language: string;
  highlighted_phrases: { phrase: string; category: string; severity: string; start_char: number; end_char: number; language: string }[];
  evidence_explanation: string[]; detected_tactics: string[];
  urgency_level: string; protective_recommendations: string[];
  llm_explanation?: string; investigation_id?: number;
}
export interface AppInspectionResult {
  risk_score: number; risk_category: string; brand_impersonation_candidate: boolean;
  developer_reputation_flags: string[]; package_identifier_findings: string[];
  dangerous_permissions_detected: { permission: string; risk_level: string; description: string; is_suspicious_for_app_type: boolean }[];
  description_anomalies: string[]; missing_verification_info: string[];
  contributing_factors: Record<string, number>; disclaimer: string;
  recommended_actions: string[]; investigation_id?: number;
}
export interface CytoscapeGraphData {
  nodes: { data: { id: string; label: string; type: string; risk_level: string; risk_score: number; metadata: Record<string, any> } }[];
  edges: { data: { id: string; source: string; target: string; relationship: string; rationale: string; weight: number } }[];
  total_nodes: number; total_edges: number; active_threat_clusters: number;
}
export interface CampaignCluster {
  cluster_id: string; cluster_name: string; size: number;
  shared_phrases: string[]; shared_urls: string[];
  average_similarity_score: number; risk_level: string;
  relationship_disclaimer: string;
  items: { message_id: string; message_text: string; sender?: string; target_brand?: string; similarity_to_centroid: number; detected_urls: string[]; created_at: string }[];
}
export interface ClusteringResult {
  total_messages_analyzed: number; total_clusters_formed: number;
  singleton_count: number; clusters: CampaignCluster[];
}
export interface TwinResult {
  brand_id: number; brand_name: string; total_scenarios_tested: number;
  scenarios_detected: number; false_positives: number; false_negatives: number;
  precision: number; recall: number; f1_score: number;
  brand_resilience_score: number; synthetic_label_warning: string;
  scenario_results: { scenario_id: string; scenario_name: string; scenario_type: string; synthetic_payload: any; expected_risk: string; detected_score: number; detected_category: string; passed: boolean; is_false_positive: boolean; is_false_negative: boolean; mitigation_recommendation: string }[];
}
export interface QualityReport {
  dataset_breakdown: { total_samples: number; scam_text_samples: number; impersonation_profile_samples: number; malicious_app_samples: number; benign_control_samples: number };
  confusion_matrix: { true_positive: number; false_positive: number; true_negative: number; false_negative: number };
  precision: number; recall: number; f1_score: number;
  false_positive_rate: number; false_negative_rate: number;
  accuracy: number; auc_roc_estimate: number; evaluation_notes: string;
  detailed_benchmarks: { sample_id: string; sample_name: string; sample_type: string; ground_truth: string; predicted_result: string; predicted_score: number; is_correct: boolean; explanation: string }[];
}
export interface CopilotResponse {
  query_type: string; summary: string; detailed_explanation: string;
  key_risk_drivers: string[]; identified_missing_evidence: string[];
  recommended_next_steps: string[];
  abuse_report?: { target_entity: string; target_type?: string; subject_line: string; report_body: string; requires_human_approval: boolean };
  customer_warning?: { title: string; urgency_tier: string; short_advisory: string; detailed_guidelines: string[]; requires_human_approval: boolean };
  is_rule_based_fallback: boolean; requires_human_approval_banner: string;
}
export interface EvidenceRecord {
  id: number; investigation_id?: number; title: string; evidence_type: string;
  file_name: string; file_size: number; mime_type: string; sha256_hash: string;
  description: string; raw_payload: any; created_at: string;
}
export const riskColor = (cat: string) => {
  switch (cat) { case 'CRITICAL': return '#EF4444'; case 'HIGH': return '#F97316'; case 'MEDIUM': return '#EAB308'; default: return '#22C55E'; }
};
export const riskBg = (cat: string) => {
  switch (cat) { case 'CRITICAL': return 'risk-critical'; case 'HIGH': return 'risk-high'; case 'MEDIUM': return 'risk-medium'; default: return 'risk-low'; }
};
