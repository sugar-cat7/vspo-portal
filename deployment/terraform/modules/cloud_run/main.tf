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
