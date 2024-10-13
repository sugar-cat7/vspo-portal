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
    body        = base64encode(each.value.body)
    oidc_token {
      service_account_email = var.cloud_scheduler_sa_email
    }
  }
}
