# Shangmin Chen - Portfolio Website

A modern, responsive portfolio website built with React, featuring smooth animations, contact form integration, and automated deployment to GitHub Pages.

## 🚀 Live Demo

Visit the live website: [https://shangmin.me](https://shangmin.me)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0, JavaScript (ES6+)
- **Styling**: CSS3 with custom animations
- **Email Service**: EmailJS for client-side email functionality
- **Smooth Scrolling**: Lenis for enhanced user experience
- **Deployment**: GitHub Pages with automated CI/CD
- **Domain**: Custom domain (shangmin.me) with CNAME configuration

## 📧 EmailJS Contact Form Setup

The contact form uses EmailJS to send emails directly from the client-side without requiring a backend server.

### Step-by-Step Setup:

1. **Create EmailJS Account**
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Verify your email address

2. **Create Email Service**
   - Go to "Email Services" in your EmailJS dashboard
   - Add a new service (Gmail, Outlook, Yahoo, etc.)
   - Follow the authentication steps for your chosen email provider
   - Note down your Service ID

3. **Create Email Template**
   - Go to "Email Templates" and create a new template
   - Use these template variables (case-sensitive):
     ```
     Subject: {{subject}}
     From: {{name}} <{{email}}>
     Message: {{message}}
     ```
   - Set the "To Email" field to your email address (shangminch@gmail.com)
   - Note down your Template ID

4. **Get Public Key**
   - Go to "Account" → "General"
   - Copy your Public Key

5. **Environment Variables Setup**
   
   **For Local Development:**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```
   
   **For Production (GitHub Pages):**
   Add these as GitHub Secrets in your repository:
   - Go to Settings → Secrets and variables → Actions
   - Add the following repository secrets:
     - `REACT_APP_EMAILJS_SERVICE_ID`
     - `REACT_APP_EMAILJS_TEMPLATE_ID`
     - `REACT_APP_EMAILJS_PUBLIC_KEY`

### EmailJS Implementation Details:

The email service is implemented in `src/utils/emailService.js` with:
- Environment variable validation
- Error handling and user feedback
- Template parameter mapping
- Fallback error messages

## 🔄 GitHub Actions Workflow

The project uses GitHub Actions for automated deployment to GitHub Pages.

### Workflow Configuration (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_EMAILJS_SERVICE_ID: ${{ secrets.REACT_APP_EMAILJS_SERVICE_ID }}
          REACT_APP_EMAILJS_TEMPLATE_ID: ${{ secrets.REACT_APP_EMAILJS_TEMPLATE_ID }}
          REACT_APP_EMAILJS_PUBLIC_KEY: ${{ secrets.REACT_APP_EMAILJS_PUBLIC_KEY }}
      
      - name: Copy CNAME to build folder
        run: |
          if [ -f public/CNAME ]; then
            cp public/CNAME build/CNAME
          elif [ -f CNAME ]; then
            cp CNAME build/CNAME
          fi
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './build'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Key Features:
- **Automatic Deployment**: Triggers on every push to main branch
- **Manual Trigger**: Can be triggered manually via GitHub UI
- **Environment Variables**: Securely injects EmailJS credentials
- **CNAME Support**: Automatically copies CNAME file for custom domain
- **Node.js 20**: Uses latest LTS version with npm caching
- **Concurrency Control**: Prevents multiple deployments from running simultaneously

## 🏠 Local Development Setup

### Prerequisites:
- Node.js 20+ (LTS recommended)
- npm or yarn package manager
- Git

### Installation Steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shangmin-chen/Shangmin-Chen.github.io.git
   cd Shangmin-Chen.github.io
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   The application will open at [http://localhost:3000](http://localhost:3000)

### Development Commands:

```bash
# Start development server with hot reload
npm start

# Run tests in interactive watch mode
npm test

# Build production bundle
npm run build

# Deploy to GitHub Pages (manual deployment)
npm run deploy
```

### Project Structure:
```
src/
├── components/          # React components
│   ├── About.jsx       # About section
│   ├── Blog.jsx        # Blog section
│   ├── Contact.jsx     # Contact form
│   ├── Experience.jsx  # Work experience
│   ├── Hero.jsx        # Hero section
│   ├── Navbar.jsx      # Navigation
│   └── Projects.jsx    # Projects showcase
├── hooks/              # Custom React hooks
│   └── useLenis.js     # Smooth scrolling hook
├── utils/              # Utility functions
│   ├── emailService.js # EmailJS integration
│   └── scrollUtils.js  # Scroll utilities
├── App.jsx             # Main app component
├── App.css            # Global styles
└── index.js           # Entry point
```

### Custom Domain Setup:

1. **CNAME File**: The `CNAME` file in the root directory contains `shangmin.me`
2. **DNS Configuration**: Point your domain's CNAME record to `shangmin-chen.github.io`
3. **Automatic Copy**: The GitHub Action automatically copies the CNAME file to the build directory

## 🚀 Deployment Process

### Automatic Deployment:
1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site updates within 2-3 minutes

### Manual Deployment:
1. Run `npm run build` to create production build
2. Run `npm run deploy` to deploy to GitHub Pages
3. Or use the "Actions" tab in GitHub to trigger the workflow manually

### Environment Variables in Production:
- EmailJS credentials are securely stored as GitHub Secrets
- Automatically injected during the build process
- No sensitive data exposed in the repository

## 🔧 Troubleshooting

### Common Issues:

1. **EmailJS Not Working**
   - Verify environment variables are set correctly
   - Check EmailJS template variables match exactly
   - Ensure EmailJS service is properly configured

2. **Build Failures**
   - Check Node.js version (requires 20+)
   - Verify all dependencies are installed
   - Check for syntax errors in components

3. **Deployment Issues**
   - Verify GitHub Pages is enabled in repository settings
   - Check GitHub Actions permissions
   - Ensure CNAME file is present for custom domain

4. **Local Development Issues**
   - Clear browser cache
   - Restart development server
   - Check console for error messages

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Lenis Smooth Scrolling](https://github.com/studio-freight/lenis)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

This is a personal portfolio website, but suggestions and improvements are welcome! Feel free to open an issue or submit a pull request.

---

**Built with ❤️ by Shangmin Chen**

