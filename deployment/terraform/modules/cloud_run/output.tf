output "cloud_run_service_url" {
  value = google_cloud_run_v2_service.vspo_portal_cron.uri
}