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

module "secret_manager" {
  source           = "../modules/secret_manager"
  sa_account_email = module.iam.cloud_run_sa_email
}

locals {
  cloud_run_job_env_vars = {
    "DB_HOST" = {
      secret_name = "db-host"
      version     = "latest"
    },
    "DB_PASSWORD" = {
      secret_name = "db-password"
      version     = "latest"
    },
    "DB_USER" = {
      secret_name = "db-user"
      version     = "latest"
    },
    "DB_DATABASE" = {
      secret_name = "db-database"
      version     = "latest"
    },
    "DB_SSL_MODE" = {
      value = "require"
    },
    "TWITCASTING_ACCESS_TOKEN" = {
      secret_name = "twitcasting-access-token"
      version     = "latest"
    },
    "TWITCH_CLIENT_SECRET" = {
      secret_name = "twitch-client-secret"
      version     = "latest"
    },
    "TWITCH_CLIENT_ID" = {
      secret_name = "twitch-client-id"
      version     = "latest"
    },
    "YOUTUBE_API_KEY" = {
      secret_name = "youtube-api-key"
      version     = "latest"
    },
    "ENV" = {
      value = "production"
    },
    "LOG_LEVEL" = {
      value = "info"
    }
  }
}

module "cloud_run_job_search" {
  source                          = "../modules/cloud_run"
  location                        = local.location
  env                             = local.env
  project                         = var.GOOGLE_PROJECT_ID
  artifact_registry_repository_id = module.artifact_registry.artifact_registry_repository_id
  cloud_run_sa_email              = module.iam.cloud_run_sa_email
  cloud_run_job_args              = ["cron", "fetch-video", "livestream", "search"]
  cloud_run_job_env_vars          = local.cloud_run_job_env_vars
}

module "cloud_run_job_update_exist_stream" {
  source                          = "../modules/cloud_run"
  location                        = local.location
  env                             = local.env
  project                         = var.GOOGLE_PROJECT_ID
  artifact_registry_repository_id = module.artifact_registry.artifact_registry_repository_id
  cloud_run_sa_email              = module.iam.cloud_run_sa_email
  cloud_run_job_args              = ["cron", "fetch-video", "livestream", "exist"]
  cloud_run_job_env_vars          = local.cloud_run_job_env_vars
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
      name     = "vspo-portal-job-search"
      schedule = "*/30 * * * *",
      headers = {
        "Content-Type" = "application/json"
      }
    },
    {
      name     = "vspo-portal-job-update-exist-stream"
      schedule = "*/30 * * * *",
      headers = {
        "Content-Type" = "application/json"
      }
    }
  ]
}