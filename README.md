# 🚀 AI Trade Nexus - Next-Generation Trading Platform

A powerful, AI-powered trading analysis platform that goes beyond TradingView with conversational AI, advanced analytics, and comprehensive market intelligence.

## ✨ Features

- **AI Trading Chatbot** - Ask about stocks, options strategies, technical analysis, risk management — with live market data auto-injected when you mention tickers
- **Advanced Technical Analysis** - RSI, MACD, Bollinger Bands, SMA/EMA, ADX, Stochastic, ATR, VWAP, OBV
- **Real-time Charts** - Interactive candlestick charts with volume, multiple timeframes, and technical overlays
- **AI-Powered Stock Analysis** - One-click deep analysis using Claude, OpenAI, Gemini, or local Ollama models
- **AI Price Projections** - Growth-rate and volatility-based price projections with confidence bands
- **News Sentiment Analysis** - Headlines with sentiment scoring from Finnhub
- **Smart Market Scanner** - Live quotes for major stocks with real-time data
- **Multi-Provider AI Support** - Bring your own API key (Claude, OpenAI, Gemini, or free local Ollama)
- **Zero Data Storage** - API keys encrypted locally with AES-256-GCM, never sent to our servers

### Planned Future Integrations

- **Gamma Exposure (GEX) Analysis** - Options positioning via Tradier API
- **Dark Pool Activity Tracking** - Institutional volume via FINRA OTC data
- **Options Flow Analysis** - Unusual options activity scanner

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

On first launch, the Setup Wizard guides you through configuration:

### 1. Market Data (Required)
- **Finnhub** (Free) - Sign up at https://finnhub.io for real-time quotes, charts, news, and earnings

### 2. AI Provider (Optional - pick one)
- **Claude (Anthropic)** - https://console.anthropic.com/ - Best reasoning and analysis
- **OpenAI (GPT-4o)** - https://platform.openai.com/api-keys - Fast and versatile
- **Google Gemini** - https://aistudio.google.com/apikey - Great multi-step reasoning
- **Ollama (Local)** - https://ollama.com/ - Free, private, no API key needed

### Security
- All API keys are encrypted locally with AES-256-GCM + PBKDF2
- Keys are only decrypted in-memory after you enter your master password
- Keys are sent to AI providers only via the local proxy server — never logged or stored server-side
- No user data is collected or transmitted to any third party

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

**Try these in the chat**:
- "Analyze TSLA" - Opens full analysis with charts, indicators, and data
- "What's a good options strategy for TSLA?" - AI answers with live price data
- "Explain RSI and how to use it for entries" - Learn trading concepts
- "How does an iron condor work?" - Options strategy breakdowns
- "What do you think about NVDA vs AMD?" - Compare stocks with live data
- "Scan market" - Opens the market scanner with live quotes

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
- **Lightweight Charts** - Candlestick and volume visualization
- **Lucide React** - Icons
- **Express** - Production server and AI proxy
- **Finnhub API** - Real-time market data
- **Multi-AI Support** - Claude, OpenAI, Gemini, Ollama

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
- Gamma Exposure (GEX) analysis via Tradier API
- Dark pool volume tracking via FINRA OTC data
- Options flow / unusual activity scanner
- Portfolio tracking and backtesting
- Real-time WebSocket data feeds
- Custom indicator builder

---

**Built with ❤️ using Claude AI**
