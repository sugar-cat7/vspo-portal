locals {
  workload_identity_pool = {
    id          = "${var.env}-github"
    provider_id = "${var.env}-github"
  }
  service_account = {
    github = {
      repository_name = "vspo-portal"
    }
  }
}
