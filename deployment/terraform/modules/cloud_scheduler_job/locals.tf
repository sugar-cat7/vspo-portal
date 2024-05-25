locals {
  project = var.project
  env     = var.env
  target_url = var.cloud_run_service_url
  schedules = toset([
    {
      name     = "${var.env}-vspo-portal-ping",
      schedule = "*/5 * * * *",
      headers = {
        "x-api-key" = "dummy-key"
      },
      body = {}
    },
  ])
}
