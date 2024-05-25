output "cloud_run_service_url" {
  value = "https://${google_cloud_run_v2_service.vspo_portal_cloud_run_v2_service.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${local.project}/jobs/${google_cloud_run_v2_service.vspo_portal_cloud_run_v2_service.name}:run"
}
