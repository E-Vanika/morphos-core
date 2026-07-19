terraform {
  required_version = ">= 1.8.0"

  # Configured by GitHub Actions with HCP Terraform organization/workspace values.
  # HCP stores state; the GitHub runner executes the Terraform commands.
  backend "remote" {}

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }
  }
}
