variable "location" {
  type = string
}

variable "env" {
  type = string
}

variable "project" {
  type = string
}

variable "artifact_registry_repository_id" {
  type = string
}

variable "cloud_run_sa_email" {
  type = string
}

# variable "cloud_run_service_args" {
#   type        = list(string)
#   description = "Cloud Run job args to override the default command."
# }

variable "cloud_run_service_env_vars" {
  type = map(object({
    value       = optional(string)
    secret_name = optional(string)
    version     = optional(string)
  }))
  description = "Environment variables for the Cloud Run job, including both literal values and secrets."
}