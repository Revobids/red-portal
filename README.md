# Red Portal

A Next.js real estate management portal built with TypeScript, Tailwind CSS, and Redux Toolkit.

## Features

- 🏢 Office Management
- 👥 Employee Management  
- 🏗️ Project Management
- 🔐 Authentication & Authorization
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

The application uses environment variables to configure the API endpoint. Create the following files:

### `.env.local` (for local development)
```
NEXT_PUBLIC_API_URL=https://revobricks-backend-core.onrender.com/api
```

### `.env.production` (for production builds)
```
NEXT_PUBLIC_API_URL=https://revobricks-backend-core.onrender.com/api
```

You can update these URLs to point to different API endpoints as needed.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build and export static files
- `npm run static` - Alias for build (static export)
- `npm run serve-static` - Serve static files locally
- `npm run start` - Start production server (SSR mode)
- `npm run lint` - Run ESLint

## Learn More


To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
