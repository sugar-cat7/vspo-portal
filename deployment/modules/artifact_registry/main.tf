resource "google_artifact_registry_repository" "vspo_portal_artifact_registry_repository" {
  location      = local.artifact_registry.location
  repository_id = local.artifact_registry.repository_id
  description   = "vspo-portal artifact registry repository"
  format        = "DOCKER"
}
