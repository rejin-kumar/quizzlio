# Quizzlio Deployment Guide

This document outlines the steps to deploy Quizzlio with the backend on Render.com and the frontend on Vercel.

## Backend Deployment on Render.com

1. Log in to your Render.com account.

2. Click on "New +" and select "Web Service".

3. Connect your GitHub repository, or use the "Public Git repository" option and enter the URL.

4. Configure the following settings:
   - **Name**: `quizzlio-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `chmod +x ./server/build.sh && ./server/build.sh`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: `/` (leave as default)

5. Set the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set this, but you can specify if needed)
   - `CORS_ORIGIN`: `https://quizzlio.vercel.app` (your Vercel frontend URL)

6. Click "Create Web Service" and wait for the deployment to complete.

7. Once deployed, note the URL (e.g., `https://quizzlio-server.onrender.com`).

## Frontend Deployment on Vercel

1. Log in to your Vercel account.

2. Click on "New Project".

3. Import your GitHub repository.

4. Configure the following settings:
   - **Project Name**: `quizzlio` (or your preferred name)
   - **Framework**: `Next.js`
   - **Root Directory**: `/` (leave as default)

5. Set the following environment variables:
   - `NEXT_PUBLIC_API_URL`: [Your Render.com backend URL, e.g., `https://quizzlio-server.onrender.com`]

6. Click "Deploy" and wait for the deployment to complete.

## Post-Deployment Tasks

1. Test the connection between your frontend and backend:
   - Visit your Vercel app URL
   - Try to create and join games
   - Monitor logs on both Vercel and Render.com for any errors

2. If you encounter CORS issues:
   - Double-check the `CORS_ORIGIN` environment variable on Render.com
   - Ensure the socket.io connection is using the correct URL on the frontend

3. Monitor performance and scale as needed:
   - Render.com free tier has some limitations, consider upgrading if needed
   - Add additional environment variables for database connections if you add persistence

## Troubleshooting

- **Socket.io connection issues**: Check browser console for errors; ensure the frontend is using the correct backend URL
- **CORS errors**: Verify the CORS settings and allowed origins in server.js
- **Slow performance**: Free tiers on both platforms may spin down with inactivity; first request might be slow

## Maintenance

- Both Vercel and Render.com will automatically deploy when you push changes to the main branch
- To update environment variables, use the respective platform's dashboard