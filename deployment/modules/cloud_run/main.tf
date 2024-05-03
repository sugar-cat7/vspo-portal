resource "google_cloud_run_v2_job" "vspo_portal_cloud_run_v2_job" {
  name     = local.cloud_run_v2_job.name
  location = local.cloud_run_v2_job.location
  template {
    template {
      containers {
        image = "us-docker.pkg.dev/cloudrun/container/hello"
      }
    }
  }
}


resource "google_project_iam_member" "cloud_run_invoker" {
  project = local.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloud_scheduler.email}"
}

resource "google_service_account" "cloud_scheduler" {
  account_id   = "${var.env}-vspo-portal-cloud-scheduler-account"
  display_name = "Cloud Scheduler Account"
}

resource "google_cloud_scheduler_job" "scheduler" {
  name        = "${var.env}-vspo-portal-cloud-run-job"
  description = "Trigger Cloud Run job every hour"
  schedule    = "*/5 * * * *"
  time_zone   = "Asia/Tokyo"

  http_target {
    uri         = "https://${google_cloud_run_v2_job.vspo_portal_cloud_run_v2_job.name}.a.run.app/"
    http_method = "POST"
    oidc_token {
      service_account_email = google_service_account.cloud_scheduler.email
    }
  }
}
