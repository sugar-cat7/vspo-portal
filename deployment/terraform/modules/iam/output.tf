output "cloud_scheduler_sa_email" {
  value = google_service_account.cloud_scheduler.email
}

output "cloud_run_sa_email" {
  value = google_service_account.cloud_run.email
}