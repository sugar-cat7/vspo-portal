resource "google_secret_manager_secret" "secret" {
  secret_id = "vspo-portal"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "secret_access_for_cloud_run" {
  secret_id = google_secret_manager_secret.secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.sa_account_email}"

  depends_on = [google_secret_manager_secret.secret]
}