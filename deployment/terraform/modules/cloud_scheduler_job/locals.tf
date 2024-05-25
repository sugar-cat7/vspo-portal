locals {
  project = var.project
  env     = var.env
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
