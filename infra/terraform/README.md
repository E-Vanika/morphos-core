# Terraform: Vercel infrastructure

This module creates the Vercel project and configures browser-safe public environment values. It intentionally does **not** store private values: the Supabase service-role key and Gemini key belong only in Render.

Render is declared separately in the repository-root `render.yaml`; it is the native Infrastructure-as-Code format for Render Free.

## Apply once

1. Install Terraform 1.8 or newer.
2. Create a Vercel token and set it only in your terminal: `VERCEL_API_TOKEN`.
3. Copy `terraform.tfvars.example` to `terraform.tfvars` and replace the placeholders.
4. Run `terraform init`, `terraform plan`, then `terraform apply` in this directory.
5. Copy the `vercel_project_id` output into the `VERCEL_PROJECT_ID` GitHub secret. Obtain `VERCEL_ORG_ID` from Vercel project settings and add it as the other GitHub secret.

Do not commit `terraform.tfvars` or Terraform state. For a shared production environment, migrate the state to a remote Terraform backend before multiple people apply changes.
