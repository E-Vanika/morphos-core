output "vercel_project_id" {
  description = "Set this value as the VERCEL_PROJECT_ID GitHub Actions secret."
  value       = vercel_project.morphos.id
}

output "vercel_project_name" {
  value = vercel_project.morphos.name
}
