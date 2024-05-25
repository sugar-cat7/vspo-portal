resource "google_cloud_run_v2_service" "vspo_portal_cloud_run_v2_service" {
  name     = local.cloud_run_v2_service.name
  location = local.cloud_run_v2_service.location
  template {
    containers {
      image = local.cloud_run_v2_service.container.image
      ports {
        container_port = 8080
      }
    }
  }
  ingress = "INGRESS_TRAFFIC_INTERNAL_ONLY"
}
