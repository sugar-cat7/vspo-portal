terraform {
  required_version = "~> 1.8.2"
  cloud {
    organization = "vspo-portal"
    workspaces {
      name = "common"
    }
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.26.0"
    }
  }
}

provider "google" {
  credentials = var.GOOGLE_CREDENTIALS
  project     = var.GOOGLE_PROJECT_ID
  region      = "asia-northeast1"
}

locals {
  env      = "blue"
  location = "asia-northeast1"
}

module "artifact_registry" {
  source   = "../modules/artifact_registry"
  location = local.location
  env      = local.env
}

module "iam" {
  source  = "../modules/iam"
  env     = local.env
  project = var.GOOGLE_PROJECT_ID
}

module "cloud_run" {
  source                          = "../modules/cloud_run"
  location                        = local.location
  env                             = local.env
  project                         = var.GOOGLE_PROJECT_ID
  artifact_registry_repository_id = module.artifact_registry.artifact_registry_repository_id
  cloud_scheduler_sa_email        = module.iam.cloud_scheduler_sa_email
}

module "cloud_scheduler_job" {
  source                   = "../modules/cloud_scheduler_job"
  location                 = local.location
  env                      = local.env
  project                  = var.GOOGLE_PROJECT_ID
  cloud_run_service_url    = module.cloud_run.cloud_run_service_url
  cloud_scheduler_sa_email = module.iam.cloud_scheduler_sa_email
  schedules = [
    {
      name     = "vspo-portal"
      schedule = "*/30 * * * *",
      headers = {
        "Content-Type" = "application/json"
      }
      body = base64encode(jsonencode({
        "overrides" : {
          "containerOverrides" : [
            {
              "name" : "blue-vspo-portal",
              "args" : ["/main", "ping"]
            }
          ]
        }
      }))
    }
  ]
}
