# Khayoon - Personal Portfolio Website

A modern, responsive personal portfolio website showcasing the work and skills of Khayoon, a Full Stack Developer with expertise in Android development, web design, and AI model building.

## 🌟 Features

### Design & User Experience
- **Dark Theme**: Elegant black background with deep purple accents inspired by modern UI trends
- **Responsive Design**: Optimized for both desktop and mobile devices
- **CSS-Only Animations**: Smooth scroll-based fade-in effects and hover animations
- **Accessible**: Semantic HTML structure with proper ARIA labels and alt text
- **Modern Typography**: Clean, readable system fonts with high contrast

### Content Sections
- **Hero Section**: Professional profile photo, name, role, and compelling summary
- **Projects Showcase**: Featured projects with descriptions and GitHub links
- **Education**: Academic background and current studies
- **Certifications**: Professional achievements and certificates
- **Skills**: Organized by categories (Programming, Mobile Dev, Web Dev, AI/ML, Tools)
- **Social Links**: Professional social media and contact links

### Technical Features
- **Static HTML/CSS**: No JavaScript dependencies for fast loading
- **GitHub Pages Ready**: Includes .nojekyll file for proper deployment
- **SEO Optimized**: Proper meta tags and semantic structure
- **Cross-Browser Compatible**: Works on all modern browsers
- **Performance Optimized**: Minimal CSS with efficient animations

## 📁 Project Structure

```
khayoon-portfolio/
├── index.html              # Main HTML file
├── styles.css              # Complete CSS styling
├── .nojekyll              # GitHub Pages compatibility
├── README.md              # This documentation
└── assets/
    ├── Khayoon.jpg        # Profile photo
    ├── linkedin.svg       # LinkedIn icon
    ├── github.svg         # GitHub icon
    ├── instagram.svg      # Instagram icon
    ├── facebook.svg       # Facebook icon
    └── telegram.svg       # Telegram icon
```

## 🚀 GitHub Pages Deployment Instructions

Follow these step-by-step instructions to deploy your portfolio to GitHub Pages:

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the **"+"** icon in the top right corner and select **"New repository"**
3. Name your repository (e.g., `khayoon-portfolio` or `your-username.github.io`)
4. Set it to **Public** (required for free GitHub Pages)
5. **Do NOT** check "Add a README file" (we already have one)
6. Click **"Create repository"**

### Step 2: Upload Your Files
**Option A: Using Git (Recommended)**
1. Extract the `khayoon-portfolio.zip` file to your computer
2. Open Terminal/Command Prompt and navigate to the extracted folder:
   ```bash
   cd path/to/khayoon-portfolio
   ```
3. Initialize git and add your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Khayoon portfolio website"
   ```
4. Connect to your GitHub repository (replace `your-username` and `your-repo-name`):
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

**Option B: Using GitHub Web Interface**
1. Extract the `khayoon-portfolio.zip` file
2. On your GitHub repository page, click **"uploading an existing file"**
3. Drag and drop all files from the extracted folder
4. Scroll down, add a commit message like "Initial portfolio upload"
5. Click **"Commit changes"**

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on the **"Settings"** tab (last tab in the repository menu)
3. Scroll down to the **"Pages"** section in the left sidebar
4. Under **"Source"**, select **"Deploy from a branch"**
5. Choose **"main"** branch and **"/ (root)"** folder
6. Click **"Save"**

### Step 4: Access Your Live Website
1. GitHub will provide you with a URL like: `https://your-username.github.io/your-repo-name/`
2. It may take 5-10 minutes for the site to become available
3. You'll see a green checkmark when deployment is successful

### Step 5: Custom Domain (Optional)
If you have a custom domain:
1. In the Pages settings, add your domain in the **"Custom domain"** field
2. Make sure to configure your domain's DNS settings to point to GitHub Pages
3. Enable **"Enforce HTTPS"** for security

## 🔧 Customization Guide

### Updating Personal Information
1. **Profile Photo**: Replace `assets/Khayoon.jpg` with your own photo (keep same filename)
2. **Name & Role**: Edit the `<h1 class="name">` and `<p class="role">` in `index.html`
3. **Summary**: Update the paragraph in the `.summary` section
4. **Location**: Change the location in `<p class="location">`

### Adding/Removing Projects
1. Find the `.projects-grid` section in `index.html`
2. Copy an existing `.project-card` article and modify:
   - Update the `<h3>` with project name
   - Change the description paragraph
   - Update the GitHub link in the `href` attribute

### Modifying Social Links
1. Locate the `.social-links` section in `index.html`
2. Update the `href` attributes with your social media URLs
3. To add new social platforms, create new SVG icons in the `assets/` folder

### Color Scheme Customization
Edit the CSS custom properties in `styles.css`:
```css
:root {
    --bg-primary: #000000;           /* Main background */
    --accent-purple: #8b5cf6;        /* Primary accent color */
    --accent-purple-light: #a78bfa;  /* Light accent */
    --text-primary: #ffffff;         /* Main text color */
    /* ... other colors */
}
```

## 🌐 Browser Support

- Chrome 88+ ✅
- Firefox 85+ ✅  
- Safari 14+ ✅
- Edge 88+ ✅
- Mobile browsers ✅

## 📱 Mobile Responsiveness

The website automatically adapts to different screen sizes:
- **Desktop**: Multi-column layouts with spacious design
- **Tablet**: Adjusted grid layouts and spacing
- **Mobile**: Single-column layout with touch-friendly interactions

## ♿ Accessibility Features

- Semantic HTML5 structure
- ARIA labels for interactive elements
- High contrast text for readability
- Keyboard navigation support
- Alternative text for images
- Reduced motion support for users who prefer minimal animations

## 🔧 Technical Notes

### CSS-Only Animations
The website uses modern CSS animations without JavaScript:
- Scroll-triggered fade-in effects
- Hover animations and transitions  
- Graceful fallbacks for older browsers
- Respects user's motion preferences

### Performance Optimizations
- Minimal CSS with efficient selectors
- Optimized SVG icons
- System fonts for fast loading
- No external dependencies

### GitHub Pages Compatibility
- `.nojekyll` file prevents Jekyll processing
- All assets use relative paths
- Static files only (no server-side processing)

## 🆘 Troubleshooting

### Site Not Loading
- Check that files are in the repository root
- Ensure GitHub Pages is enabled in repository settings
- Wait 5-10 minutes for changes to propagate

### Images Not Displaying  
- Verify image files are in the `assets/` folder
- Check that file names match exactly (case-sensitive)
- Ensure images are under GitHub's file size limit (25MB)

### Animations Not Working
- Some older browsers may not support all CSS animations
- The site gracefully degrades to show content without animations
- Check browser console for any errors

## 📄 License

This portfolio template is free to use and modify for personal and commercial purposes. No attribution required, but appreciated!

---

**Created for Khayoon** - Full Stack Developer specializing in Android development, web design, and AI model building.

For updates or support, visit the [GitHub repository](https://github.com/khion213).