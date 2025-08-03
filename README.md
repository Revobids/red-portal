# Red Portal

A Next.js real estate management portal built with TypeScript, Tailwind CSS, and Redux Toolkit.

## Features

- 🏢 Office Management
- 👥 Employee Management  
- 🏗️ Project Management
- 🔐 Authentication & Authorization
- Vercel
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Static Build

Generate a static build for deployment:

```bash
npm run build
```

This will create an optimized static build in the `out/` directory.

### Serve Static Files Locally

To test the static build locally:

```bash
npm run serve-static
```

## Environment Configuration

The application automatically switches between development and production API endpoints:

- **Development**: `http://localhost:3000/`
- **Production**: `https://revobricks-backend-core.onrender.com/`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build and export static files
- `npm run static` - Alias for build (static export)
- `npm run serve-static` - Serve static files locally
- `npm run start` - Start production server (SSR mode)
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel (Recommended)

Since your GitHub repository is already linked to Vercel:

1. **Automatic Deployment**: 
   - Push your changes to the `main` branch (already done!)
   - Vercel will automatically detect the changes and deploy

2. **Manual Deployment via Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Find your `red-portal` project
   - Click "Deploy" or wait for automatic deployment

3. **Vercel Configuration** (already configured):
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Framework Preset: Next.js (Static)

### Deploy to Other Platforms

The static files in the `out/` directory can be deployed to:

- **Netlify**: Drag and drop the `out/` folder
- **GitHub Pages**: Copy `out/` contents to your Pages repository
- **AWS S3**: Upload `out/` contents to an S3 bucket
- **Any Static Host**: Upload the `out/` directory contents

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
