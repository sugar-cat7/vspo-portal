variable "location" {
  type = string
}

variable "env" {
  type = string
}

variable "project" {
  type = string
}

variable "cloud_run_service_url" {
  type = string
}

variable "schedules" {
  type = set(list(object({
    name     = string
    schedule = string
    headers  = map(string)
    body     = string
  })))
}
