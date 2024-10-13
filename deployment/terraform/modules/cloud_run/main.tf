resource "google_cloud_run_v2_service" "vspo_portal_cloud_run_v2_service" {
  name     = local.cloud_run_v2_service.name
  location = local.cloud_run_v2_service.location
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  template {
    service_account = var.cloud_run_sa_email
    containers {
      name  = local.cloud_run_v2_service.container.name
      image = local.cloud_run_v2_service.container.image

      # args = var.cloud_run_service_args
      ports {
        container_port = 8080
      }

      dynamic "env" {
        for_each = var.cloud_run_service_env_vars
        content {
          name = env.key
          dynamic "value_source" {
            for_each = env.value.secret_name != null ? [1] : []
            content {
              secret_key_ref {
                secret  = env.value.secret_name
                version = lookup(env.value, "version", "latest")
              }
            }
          }
          value = env.value.secret_name == null ? env.value.value : null
        }
      }
    }
  }
}
