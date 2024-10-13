resource "google_secret_manager_secret" "secret" {
  for_each = { for secret in var.secret_manager_secrets : secret.secret_name => secret }

  secret_id = each.value.secret_name
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "secret_access_for_cloud_run" {
  for_each = { for secret in var.secret_manager_secrets : secret.secret_name => secret }

  secret_id = "projects/${var.project_id}/secrets/${each.value.secret_name}"

  role   = "roles/secretmanager.secretAccessor"
  member = "serviceAccount:${var.sa_account_email}"
}