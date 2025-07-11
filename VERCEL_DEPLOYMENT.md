# Vercel Deployment Guide

This project has been configured for deployment on Vercel with a fresh new configuration.

## Project Structure

- **Frontend**: React app in `client/src/`
- **Backend**: Express API in `server/` and `api/`
- **Build Output**: Static files in `dist/public/`

## New Vercel Configuration

The `vercel.json` file has been updated with:

- Modern Vercel v2 configuration
- Proper API routing to `/api/index.ts`
- Static file serving for the React frontend
- Optimized build process

## Deployment Steps

### Option 1: Using Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Option 2: Using the deployment script

1. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### Option 3: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on pushes to main branch

## Environment Variables

Make sure to set these environment variables in your Vercel dashboard:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `DATABASE_URL` (if using external database)

## Build Process

The build process now:
1. Builds the React frontend using Vite
2. Outputs static files to `dist/public/`
3. Serves API requests through the serverless function at `api/index.ts`

## API Routes

All API routes are now handled by the serverless function at `api/index.ts`, which imports and uses the routes from `server/routes.ts`.

## Troubleshooting

If you encounter issues:

1. Check the Vercel function logs in the dashboard
2. Ensure all environment variables are set
3. Verify the build output in `dist/public/`
4. Test API endpoints locally before deploying

## Local Development

For local development, continue using:
```bash
npm run dev
```

This will start the full-stack development server with hot reloading. 