locals {
  project    = var.project
  env        = var.env
  target_url = var.cloud_run_service_url
  schedules  = toset(var.schedules)
}
