locals {
  artifact_registry = {
    repository_id = "${var.env}-vspo-portal"
    location      = var.location
  }
}
