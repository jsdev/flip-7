# Netlify Deployment Guide

## Quick Setup

1. **Sign up for Netlify**: Go to [netlify.com](https://netlify.com) and sign up with your GitHub account.

2. **Create a new site**: 
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your `flip-7` repository
   - Netlify will auto-detect the build settings from `netlify.toml`

3. **Manual deployment** (optional):
   ```bash
   npm run build
   # Then drag and drop the `dist` folder to Netlify's deploy area
   ```

## Automatic Deployment with GitHub Actions

For automatic deployments on every push to main:

1. **Get Netlify credentials**:
   - Go to your Netlify site settings
   - Copy the "Site ID" from Site settings → General
   - Go to User settings → Applications → Personal access tokens
   - Create a new token and copy it

2. **Add GitHub secrets**:
   - Go to your GitHub repository settings
   - Navigate to Secrets and variables → Actions
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your personal access token
     - `NETLIFY_SITE_ID`: Your site ID

3. **Push to main branch**: The workflow will automatically deploy your site!

## Configuration Files

- `netlify.toml`: Netlify build and deployment configuration
- `.github/workflows/netlify-deploy.yml`: GitHub Actions workflow for automatic deployment
- `vite.config.js`: Updated to use root path for Netlify

## Benefits of Netlify over GitHub Pages

- ✅ No base path issues (no `/flip-7/` subdirectory)
- ✅ Better performance with global CDN
- ✅ Automatic HTTPS
- ✅ Branch previews for pull requests
- ✅ Easy rollbacks
- ✅ Built-in form handling (if needed later)
- ✅ Environment variables support

## URL

Your site will be available at: `https://[your-site-name].netlify.app`

You can customize the subdomain in Netlify's site settings.
