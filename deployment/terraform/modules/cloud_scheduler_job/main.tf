

resource "google_service_account" "cloud_scheduler" {
  account_id   = "${local.env}vspocronscheduler"
  display_name = "Cloud Scheduler Account"
}

resource "google_project_iam_member" "cloud_run_invoker" {
  project = local.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloud_scheduler.email}"
}

resource "google_cloud_scheduler_job" "scheduler" {
  for_each = { for idx, val in local.schedules : val.name => val }

  name        = each.value.name
  description = "Trigger Cloud Run"
  schedule    = each.value.schedule
  time_zone   = "Asia/Tokyo"

  http_target {
    uri         = local.target_url
    http_method = "POST"
    headers     = each.value.headers
    body        = each.value.body
    oidc_token {
      service_account_email = google_service_account.cloud_scheduler.email
    }
  }
}
