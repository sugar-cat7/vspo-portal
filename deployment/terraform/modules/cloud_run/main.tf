resource "google_cloud_run_v2_service" "vspo_portal_cron" {
  name     = local.cloud_run_v2_service.name
  location = local.cloud_run_v2_service.location
  ingress  = "INGRESS_TRAFFIC_ALL"
  template {
    service_account = var.cloud_run_sa_email
    containers {
      name       = local.cloud_run_v2_service.container.name
      image      = local.cloud_run_v2_service.container.image
      depends_on = ["datadog-agent"]
      # args = var.cloud_run_service_args
      ports {
        container_port = 8080
      }
      startup_probe {
        http_get {
          path = "/ping"
          port = 8080
        }
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 3
        failure_threshold     = 3
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
    containers {
      name  = "datadog-agent"
      image = "${var.location}-docker.pkg.dev/${var.project}/${var.artifact_registry_repository_id}/datadog-agent:latest"
      startup_probe {
        http_get {
          path = "/info"
          port = 8126
        }
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 3
        failure_threshold     = 3
      }
      dynamic "env" {
        for_each = var.datadog_env_vars
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
