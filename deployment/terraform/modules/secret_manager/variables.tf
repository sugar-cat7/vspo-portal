variable "project_id" {
  type = string
}

variable "sa_account_email" {
  type = string
}

variable "secret_manager_secrets" {
  description = "List of secrets with their names and versions"
  type = list(object({
    secret_name = string
    version     = optional(string)
  }))
}