resource "google_cloud_run_v2_job" "vspo_portal_cloud_run_v2_job" {
  name     = local.cloud_run_v2_job.name
  location = local.cloud_run_v2_job.location

  template {
    template {
      service_account = var.cloud_run_sa_email
      containers {
        name  = local.cloud_run_v2_job.container.name
        image = local.cloud_run_v2_job.container.image

        args = var.cloud_run_job_args

        ports {
          container_port = 8080
        }

        dynamic "env" {
          for_each = var.cloud_run_job_env_vars
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
}
