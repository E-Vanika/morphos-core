variable "vercel_team_id" {
  description = "Vercel team/owner ID. Leave null when deploying to a personal account."
  type        = string
  default     = null
}

variable "project_name" {
  description = "Name for the Vercel project."
  type        = string
  default     = "morphos-core"
}

variable "supabase_url" {
  description = "Public Supabase project URL."
  type        = string
}

variable "supabase_anon_key" {
  description = "Public Supabase anonymous browser key."
  type        = string
}

variable "api_url" {
  description = "Public Render FastAPI URL, without a trailing slash."
  type        = string
}

variable "site_name" {
  description = "Brand shown by the frontend."
  type        = string
  default     = "Clarity Collective"
}

variable "domain_preset" {
  description = "Domain vocabulary profile used by the public website."
  type        = string
  default     = "professional-services"
}
