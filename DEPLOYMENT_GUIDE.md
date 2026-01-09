# Deployment Guide for Ashwini Cargo ERP

You have two separate applications (Client App and Admin Panel). The best way to deploy them is as **two separate sites** on Netlify, using your Hostinger subdomains to point to them.

## Recommended Strategy
Use two subdomains (you can create these in Hostinger DNS):
1.  **Admin Panel**: e.g., `admin.yourdomain.com` (or `erp.yourdomain.com`)
2.  **Client/Tracking App**: e.g., `track.yourdomain.com` (or just `yourdomain.com`)

---

## Step 1: Prepare for Deployment
I have already created the necessary `_redirects` files in both projects. This ensures that when you refresh a page like `/users`, it doesn't give a 404 error.

## Step 2: Push to GitHub
1.  Push your entire project to a **GitHub repository**.
    - If you haven't initialized git:
      ```bash
      git init
      git add .
      git commit -m "Ready for deploy"
      # Link to your GitHub repo...
      ```

## Step 3: Deploy to Netlify (Frontend)
1.  Sign up/Log in to [Netlify.com](https://www.netlify.com).
2.  Click **"Add new site"** -> **"Import an existing project"**.
3.  Connect to **GitHub** and select your repository.

### **Deploying the Client App (Tracking)**
4.  **Site Settings**:
    - **Base directory**: `(leave empty)`
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
5.  Click **Deploy Mode**.

### **Deploying the Admin Panel**
6.  Go back to Dashboard and click **"Add new site"** again (same repo).
7.  **Site Settings (Crucial)**:
    - **Base directory**: `admin-panel`
    - **Build command**: `npm run build`
    - **Publish directory**: `admin-panel/dist`
8.  Click **Deploy Mode**.

## Step 4: Pointing Hostinger Domain to Netlify
Once deployments are live, Netlify gives you random URLs (e.g., `jolly-panda.netlify.app`).

1.  In **Netlify**:
    - Go to **Domain Management** -> **Add a domain**.
    - Enter your Hostinger subdomain (e.g., `admin.ashwinicargo.com`).
    - It will tell you to add a **CNAME record**. Copty the target URL (e.g., `jolly-panda.netlify.app`).

2.  In **Hostinger**:
    - Go to **DNS Zone Editor**.
    - Add a **CNAME** record:
        - **Name**: `admin` (for admin.ashwinicargo.com)
        - **Target**: `jolly-panda.netlify.app`
        - **TTL**: 3600
    - Save.

Repeat for the Client App subdomain.

## Comparison: Netlify vs Hostinger
| Feature | Netlify (Recommended) | Hostinger File Manager |
| :--- | :--- | :--- |
| **Speed** | Extremely Fast (Global CDN) | Good (Depends on plan) |
| **Updates** | **Auto-deploy** when you git push | Manual Upload of `dist` folder |
| **Setup** | Easy (Auto SSL) | Medium (Manual SSL config sometimes) |
| **SPA** | easy `_redirects` support | Requires `.htaccess` editing |

**Recommendation**: Use **Netlify**. Point your Hostinger DNS to Netlify. It saves you hours of maintenance time later.
