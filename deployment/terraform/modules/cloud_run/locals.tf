locals {
  project = var.project
  env     = var.env
  cloud_run_v2_job = {
    name     = "${var.env}-vspo-portal"
    location = var.location
    container = {
      name  = "${var.env}-vspo-portal"
      image = "${var.location}-docker.pkg.dev/${var.project}/${var.artifact_registry_repository_id}/vspo-portal-cron:latest"
    }
  }
}
