# 🚀 AI Trade Nexus - Next-Generation Trading Platform

A powerful, AI-powered trading analysis platform that goes beyond TradingView with conversational AI, advanced analytics, and comprehensive market intelligence.

## ✨ Features

- **Conversational AI Assistant** - Ask anything about stocks, strategies, and markets
- **Advanced Technical Analysis** - RSI, MACD, Bollinger Bands, SMA, ADX, Stochastic, ATR, VWAP, OBV
- **Gamma Exposure (GEX) Analysis** - Track options positioning and market dynamics
- **Dark Pool Activity Tracking** - Monitor institutional trading
- **AI Price Predictions** - Machine learning-based forecasts
- **Sentiment Analysis** - Social, news, and institutional sentiment
- **Smart Market Scanner** - Find opportunities across markets
- **Options Flow Analysis** - Track unusual options activity
- **Real-time Charts** - Interactive price and volume visualization

## 🏃 Quick Start - Run Locally

### Prerequisites
- Node.js 16+ (Download from https://nodejs.org)
- npm or yarn package manager

### Installation

1. **Extract the files** (if you received a zip) or **navigate to the project folder**:
```bash
cd ai-trading-nexus
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
   - The app will automatically open at `http://localhost:3000`
   - If not, manually visit: http://localhost:3000

That's it! You're now running the platform locally.

---

## 🌐 Deploy to the Internet (FREE)

### Option 1: Vercel (Recommended - Easiest)

1. **Create account**: Go to https://vercel.com and sign up (free)

2. **Install Vercel CLI**:
```bash
npm install -g vercel
```

3. **Deploy**:
```bash
vercel
```

4. **Follow the prompts**:
   - Login to your Vercel account
   - Accept defaults (just press Enter)
   - Your app will be live in ~30 seconds!

5. **Share the URL** with friends (e.g., `https://ai-trading-nexus.vercel.app`)

**To update later**:
```bash
vercel --prod
```

### Option 2: Netlify (Also Great)

1. **Create account**: Go to https://netlify.com and sign up (free)

2. **Build the app**:
```bash
npm run build
```

3. **Deploy via Drag & Drop**:
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder onto the page
   - Done! Your site is live.

**OR use Netlify CLI**:
```bash
npm install -g netlify-cli
netlify deploy
```

### Option 3: GitHub Pages (Free Static Hosting)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-trading-nexus.git
git push -u origin main
```

2. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

3. **Add to package.json** scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

4. **Update vite.config.js** - add base path:
```javascript
export default defineConfig({
  base: '/ai-trading-nexus/',
  // ... rest of config
})
```

5. **Deploy**:
```bash
npm run deploy
```

6. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: gh-pages branch
   - Your site: `https://YOUR_USERNAME.github.io/ai-trading-nexus/`

---

## 🖥️ VPS/Server Deployment (For Advanced Users)

If you want full control with a custom domain:

### Using PM2 (Process Manager)

1. **On your server**, install Node.js and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

2. **Upload your project** (via git, scp, or ftp)

3. **Install dependencies**:
```bash
cd ai-trading-nexus
npm install
npm run build
```

4. **Serve with PM2**:
```bash
pm2 serve dist 3000 --name "ai-trading-nexus" --spa
pm2 save
pm2 startup
```

5. **Set up Nginx** (reverse proxy):
```bash
sudo apt install nginx
```

Create `/etc/nginx/sites-available/trading`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/trading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Configuration

### Using Real Market Data APIs

To integrate real market data, sign up for these services:

1. **Alpha Vantage** (Free tier available)
   - Sign up: https://www.alphavantage.co/support/#api-key
   - Add to `.env`:
   ```
   VITE_ALPHA_VANTAGE_KEY=your_key_here
   ```

2. **Polygon.io** (Stocks/Options data)
   - Sign up: https://polygon.io
   - Add to `.env`:
   ```
   VITE_POLYGON_KEY=your_key_here
   ```

3. **Finnhub** (Free real-time data)
   - Sign up: https://finnhub.io
   - Add to `.env`:
   ```
   VITE_FINNHUB_KEY=your_key_here
   ```

### API Integration Example

In `src/App.jsx`, replace the `generateStockData` function with real API calls:

```javascript
const fetchRealStockData = async (ticker) => {
  const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`
  );
  const data = await response.json();
  // Process and return data
};
```

---

## 📱 Share with Friends

Once deployed:

### Vercel/Netlify
- Share the URL: `https://your-app.vercel.app`
- Anyone can access it instantly
- No login required
- Works on mobile and desktop

### For Private Access
- Add authentication (Auth0, Clerk, or Firebase)
- Set up environment variables for API keys
- Implement user accounts and portfolios

---

## 🎯 Usage Tips

**Try these commands in the chat**:
- "Analyze TSLA with gamma exposure"
- "Find stocks with oversold RSI"
- "What's the best options strategy for NVDA?"
- "Scan for breakout candidates"
- "Explain dark pool activity on AAPL"

---

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Chart visualization
- **Lucide React** - Icons
- **Claude AI API** - Conversational intelligence

---

## 🐛 Troubleshooting

**Port already in use**:
```bash
# Change port in vite.config.js or kill process
lsof -ti:3000 | xargs kill -9
```

**Build errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Deployment issues**:
- Check `dist` folder was created after `npm run build`
- Verify all environment variables are set
- Check browser console for errors

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

Want to add features? Fork the repo and submit a PR!

Ideas:
- Real-time WebSocket data feeds
- Portfolio tracking and backtesting
- Custom indicator builder
- Automated trading signals
- Mobile app version

---

**Built with ❤️ using Claude AI**
