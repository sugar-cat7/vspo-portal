resource "google_cloud_scheduler_job" "scheduler" {
  for_each = { for idx, val in var.schedules : val.name => val }

  name        = each.value.name
  description = "Trigger Cloud Run"
  schedule    = each.value.schedule
  time_zone   = "Asia/Tokyo"

  http_target {
    uri         = each.value.target_url
    http_method = "POST"
    headers     = each.value.headers
    body        = each.value.body
    oauth_token {
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
      service_account_email = var.cloud_scheduler_sa_email
    }
  }
}
