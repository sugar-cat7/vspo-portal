locals {
  project = var.project
  cloud_run_v2_job = {
    name     = "${var.env}-vspo-portal"
    location = var.location
  }
}
