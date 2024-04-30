
resource "google_iam_workload_identity_pool" "vspo_portal_workload_identity_pool" {
  workload_identity_pool_id = local.workload_identity_pool.id
  display_name              = "GitHub"
  description               = "GitHub Actions Workload Identity Pool"
}

resource "google_iam_workload_identity_pool_provider" "vspo_portal_workload_identity_pool_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.vspo_portal_workload_identity_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = local.workload_identity_pool.provider_id
  display_name                       = "GitHub"
  description                        = "GitHub Actions Workload Identity Pool Provider"
  attribute_mapping = {
    "google.subject" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_project_iam_member" "vspo_portal_workload_identity_user" {
  project = local.project
  role    = "roles/iam.workloadIdentityUser"
  member  = "serviceAccount:${google_service_account.vspo_portal_sa.email}"
}

resource "google_service_account_iam_binding" "vspo_portal_workload_identity_user" {
  service_account_id = google_service_account.vspo_portal_sa.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "principal://iam.googleapis.com/${google_iam_workload_identity_pool.vspo_portal_workload_identity_pool.name}/subject/${local.service_account.github.repository_name}"
  ]
}

resource "google_service_account" "vspo_portal_sa" {
  account_id   = "github"
  display_name = "github"
  description  = "GitHub Actions Service Account"
}
