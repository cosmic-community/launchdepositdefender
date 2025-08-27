# DepositDefender

![DepositDefender Preview](https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=300&fit=crop&auto=format)

A privacy-first web application that guides renters through room-by-room move-out evidence capture and generates professional PDF reports. Protect your security deposit with comprehensive documentation—all stored locally on your device.

## ✨ Features

- **🏠 Guided Room Checklists** - Step-by-step checklists tailored to each room type
- **📸 Photo & Video Capture** - Compress and watermark media with date/time stamps
- **🏷️ Severity Tagging** - Tag issues by severity (minor, moderate, major) with notes
- **📄 Client-Side PDF Generation** - Professional reports with no server upload required
- **🔗 Secure Sharing** - Share reports via unique links with 7-day expiration
- **📊 Progress Tracker** - Visual completion indicators for each room
- **📱 PWA Capabilities** - Installable mobile app with offline functionality

## 🚀 Clone this Project

<!-- CLONE_PROJECT_BUTTON -->

## 💡 Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Create a privacy-first web app called "DepositDefender" using Next.js and TypeScript that guides renters through room-by-room move-out evidence capture and generates professional PDF reports. The app should include guided room checklists, photo/video capture with watermarking, severity tagging, client-side PDF generation, secure sharing options, progress tracking, and PWA capabilities. Store everything locally using IndexedDB for maximum privacy.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (local-first)
- **PDF Generation**: jsPDF with image embedding
- **Image Processing**: Canvas API for compression and watermarking
- **PWA**: Service Worker with offline capabilities
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser with IndexedDB support

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server:
   ```bash
   bun run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
bun run build
bun run start
```

## 📱 PWA Installation

DepositDefender can be installed as a Progressive Web App:

1. Visit the app in a modern browser
2. Look for the "Install" prompt or use browser menu
3. The app will be available offline with full functionality
4. Data syncs automatically when back online

## 🏠 Room Templates

The app includes comprehensive checklists for:

- **Kitchen**: Appliances, cabinets, countertops, plumbing
- **Bathroom**: Fixtures, tiles, ventilation, water damage
- **Bedroom**: Walls, flooring, windows, closets
- **Living Room**: Flooring, walls, fixtures, electrical
- **General Areas**: Hallways, stairs, storage, outdoor spaces

## 📄 PDF Report Features

Generated reports include:

- Property and tenant information
- Room-by-room documentation with photos
- Issue severity classifications
- Timestamp and watermark verification
- Professional formatting for legal use

## 🔒 Privacy & Security

- **Local Storage**: All data stored in IndexedDB on your device
- **No Server Uploads**: Media and reports generated client-side
- **Optional Sharing**: Secure links only when you choose to share
- **7-Day Expiration**: Shared links automatically expire for privacy

## 🌐 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with zero configuration

### Netlify
1. Build the static export: `bun run build && bun run export`
2. Upload `out` folder to Netlify
3. Configure as SPA with `_redirects` file

### Self-Hosted
Build and serve the static files from any web server.
