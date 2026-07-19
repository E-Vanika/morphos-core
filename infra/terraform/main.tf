provider "vercel" {
  team = var.vercel_team_id
}

resource "vercel_project" "morphos" {
  name      = var.project_name
  framework = "nextjs"
}

resource "vercel_project_environment_variable" "public_config" {
  for_each = {
    NEXT_PUBLIC_SUPABASE_URL      = var.supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
    NEXT_PUBLIC_API_URL           = var.api_url
    NEXT_PUBLIC_SITE_NAME         = var.site_name
    NEXT_PUBLIC_DOMAIN_PRESET     = var.domain_preset
  }

  project_id = vercel_project.morphos.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview"]
  sensitive  = false
}
