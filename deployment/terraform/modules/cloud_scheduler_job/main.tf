

resource "google_service_account" "cloud_scheduler" {
  account_id   = "${local.env}scheduler"
  display_name = "Cloud Scheduler Account"
}

resource "google_project_iam_member" "cloud_run_invoker" {
  project = local.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloud_scheduler.email}"
}

resource "google_cloud_scheduler_job" "scheduler" {
  for_each = { for idx, val in local.schedules : idx => val }

  name        = each.value.name
  description = "Trigger Cloud Run"
  schedule    = each.value.schedule
  time_zone   = "Asia/Tokyo"

  http_target {
    uri         = "https://${google_cloud_run_v2_service.vspo_portal_cloud_run_v2_service.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${local.project}/jobs/${google_cloud_run_v2_service.vspo_portal_cloud_run_v2_service.name}:run"
    http_method = "POST"
    headers     = each.value.headers
    body        = jsonencode(each.value.body)
    oidc_token {
      service_account_email = google_service_account.cloud_scheduler.email
    }
  }
}

