# Deploying POS System to Render

This guide explains how to deploy the POS System to Render.com for production use.

## Prerequisites

- A [Render.com](https://render.com) account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Methods

### Method 1: Using render.yaml (Recommended)

The repository includes a `render.yaml` file for automated deployment.

1. **Connect your repository to Render**
   - Log in to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Select the repository containing this POS system

2. **Render will automatically detect the `render.yaml` file**
   - Review the configuration
   - Click "Apply" to create the service

3. **Configure environment variables (if needed)**
   - The following variables are pre-configured in `render.yaml`:
     - `NODE_ENV=production`
     - `PORT=10000`
     - `DATABASE_PATH=/opt/render/project/src/pos_database.sqlite`
     - `BUSINESS_NAME=My Business`
     - `BUSINESS_TYPE=retail`
     - `CURRENCY=USD`
     - `TAX_RATE=0.08`
     - `RECEIPT_FOOTER=Thank you for your business!`
   - You can override these in the Render Dashboard under Environment

4. **Deploy**
   - Render will automatically build and deploy your application
   - The build process will:
     - Install all dependencies
     - Build the backend TypeScript code
     - Build the frontend React application
     - Copy frontend assets to serve from the backend

### Method 2: Manual Setup

1. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure the service:

2. **Basic Settings**
   - **Name**: `pos-system` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: Leave empty
   - **Environment**: Node
   - **Build Command**: `chmod +x ./build.sh && ./build.sh`
   - **Start Command**: `npm start`

3. **Environment Variables**
   Add the following environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_PATH=/opt/render/project/src/pos_database.sqlite
   BUSINESS_NAME=Your Business Name
   BUSINESS_TYPE=retail
   CURRENCY=USD
   TAX_RATE=0.08
   RECEIPT_FOOTER=Thank you for your business!
   ```

4. **Persistent Disk (Important!)**
   - Add a disk to persist your SQLite database
   - **Name**: `pos-database`
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: 1 GB (sufficient for most POS operations)

   ⚠️ **Without a persistent disk, your database will be lost on each deployment!**

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

## Post-Deployment

### Access Your Application

Once deployed, your application will be available at:
```
https://your-service-name.onrender.com
```

### Initial Setup

1. Visit your deployed application
2. Go to Settings page to configure:
   - Business name
   - Business type
   - Tax rate
   - Currency
   - Receipt footer

3. Add your products in the Products page
4. Start using the POS system!

### Database Management

**Backup Database:**
```bash
# Use Render's shell access to backup
render shell your-service-name
cp /opt/render/project/src/pos_database.sqlite /tmp/backup.sqlite
# Download via Render's file browser or SCP
```

**Restore Database:**
- Upload your backup database via Render's shell
- Replace the database file at the mount path

## Customizing Environment Variables

You can update environment variables at any time:

1. Go to your service in Render Dashboard
2. Click "Environment" in the sidebar
3. Add/Edit variables
4. Click "Save Changes"
5. Render will automatically redeploy

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `DATABASE_PATH` | SQLite database location | `/opt/render/project/src/pos_database.sqlite` |
| `BUSINESS_NAME` | Your business name | `My Business` |
| `BUSINESS_TYPE` | Business type (retail, restaurant, etc.) | `retail` |
| `CURRENCY` | Currency code (USD, EUR, GBP, etc.) | `USD` |
| `TAX_RATE` | Tax rate as decimal (0.08 = 8%) | `0.08` |
| `RECEIPT_FOOTER` | Custom message on receipts | `Thank you for your business!` |

## Monitoring and Logs

### View Logs
1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time application logs

### Monitor Performance
- Render provides metrics for:
  - CPU usage
  - Memory usage
  - Request rates
  - Response times

## Scaling

### Free Tier
- The free tier includes:
  - 750 hours of runtime per month
  - Automatic sleep after 15 minutes of inactivity
  - Cold starts when service wakes up

### Paid Tier Benefits
- No automatic sleep
- Faster performance
- More memory and CPU
- Better for production use

To upgrade:
1. Go to service settings
2. Select a paid plan
3. Confirm upgrade

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Review build logs for specific errors

### Database Issues
- Ensure persistent disk is mounted
- Check `DATABASE_PATH` environment variable
- Verify disk has sufficient space

### Application Won't Start
- Check logs for error messages
- Verify all environment variables are set
- Ensure `NODE_ENV=production` is set

### Frontend Not Loading
- Verify build process completed successfully
- Check that `dist/public` directory contains frontend files
- Review server logs for static file serving errors

## Security Best Practices

1. **Enable HTTPS** (automatic on Render)
2. **Add Authentication** - The current system doesn't have user auth
3. **Backup Regularly** - Download database backups frequently
4. **Monitor Logs** - Check for suspicious activity
5. **Update Dependencies** - Keep packages up to date
6. **Environment Variables** - Never commit sensitive data to git

## Custom Domain

To use your own domain:

1. Go to service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. Render provides free SSL certificates

## Continuous Deployment

Render automatically deploys when you push to your connected branch:

1. Make changes locally
2. Commit and push to your repository
3. Render automatically detects changes
4. Builds and deploys new version
5. Zero-downtime deployment

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [POS System Repository Issues](https://github.com/your-repo/issues)

## Cost Estimate

**Free Tier:**
- Web Service: Free (with limitations)
- Disk (1GB): Free
- Total: $0/month

**Starter Tier:**
- Web Service: $7/month
- Disk (1GB): Free
- Total: $7/month

**Pro Tier:**
- Web Service: $25/month
- Additional disk: $0.25/GB/month
- Total: ~$25-30/month

---

**Need Help?** Check the main [README.md](README.md) for general application documentation.
