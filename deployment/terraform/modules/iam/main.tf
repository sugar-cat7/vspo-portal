
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
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
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

resource "google_project_iam_member" "service_account_user" {
  project = local.project
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.vspo_portal_sa.email}"
}

resource "google_project_iam_member" "vspo_portal_artifactregistry_writer" {
  project = local.project
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.vspo_portal_sa.email}"
}

resource "google_project_iam_member" "vspo_portal_run_admin" {
  project = local.project
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.vspo_portal_sa.email}"
}

resource "google_service_account_iam_binding" "vspo_portal_workload_identity_user" {
  service_account_id = google_service_account.vspo_portal_sa.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.vspo_portal_workload_identity_pool.name}/attribute.repository/${local.service_account.github.repository_name}"
  ]
}

resource "google_service_account" "vspo_portal_sa" {
  account_id   = "github"
  display_name = "github"
  description  = "GitHub Actions Service Account"
}

// Cloud Scheduler
resource "google_service_account" "cloud_scheduler" {
  account_id   = "${local.env}vspocronscheduler"
  display_name = "Cloud Scheduler Account"
}

resource "google_project_iam_member" "cloud_run_admin" {
  project = local.project
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloud_scheduler.email}"
}
