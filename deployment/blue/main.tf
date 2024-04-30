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

module "artifact_registry" {
  source   = "../modules/artifact_registry"
  location = "asia-northeast1"
  env      = "blue"
}

