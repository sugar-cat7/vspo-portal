locals {
  project = var.project
  env     = var.env
  cloud_run_v2_job = {
    name     = "${var.env}-vspo-portal"
    location = var.location
  }
}
