output "cloud_run_service_url" {
  value = "https://${google_cloud_run_v2_job.vspo_portal_cloud_run_v2_job.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${local.project}/jobs/${google_cloud_run_v2_job.vspo_portal_cloud_run_v2_job.name}:run"
}
