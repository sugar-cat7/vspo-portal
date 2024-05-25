resource "google_cloud_run_v2_job" "vspo_portal_cloud_run_v2_job" {
  name     = local.cloud_run_v2_job.name
  location = local.cloud_run_v2_job.location
  template {
    template {
      containers {
        image = local.cloud_run_v2_job.container.image
        ports {
          container_port = 8080
        }
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "default" {
  location = google_cloud_run_v2_service.vspo_portal_cloud_run_v2_job.location
  service  = google_cloud_run_v2_service.vspo_portal_cloud_run_v2_job.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.cloud_scheduler_sa_email}"
}
