# Stock Portfolio Manager

A full-stack application for tracking and managing stock investments with performance analytics and insights.

## Features
- Portfolio management with stock entry and removal
- Performance tracking across multiple time periods
- Interactive dashboard with graphs and insights
- Real-time portfolio rebalancing suggestions
- Historical performance analysis
- Stock price tracking using Alpha Vantage API

## Tech Stack
- Backend: Python (FastAPI)
- Frontend: Next.js/React with TypeScript
- Database: SQLite
- API: Alpha Vantage for stock data

## Project Structure
```
portfoliotracker/
├── backend/
│   ├── main.py           # FastAPI application entry point
│   ├── portfolio.py      # Portfolio management logic
│   ├── performance.py    # Performance analysis
│   ├── portfolio.db      # SQLite database
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── pages/           # Next.js pages
│   ├── services/        # API service layer
│   ├── package.json     # Node.js dependencies
│   └── tsconfig.json    # TypeScript configuration
├── venv/                # Python virtual environment
└── setup.sh            # Project setup script
```

## Prerequisites
- Python 3.8+
- Node.js 14+
- Alpha Vantage API key (free tier available at https://www.alphavantage.co/)

## Quick Setup
1. Clone the repository
2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   This will:
   - Create a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Set up your Alpha Vantage API key

## Running the Application

### Backend
1. Activate the virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

### Frontend
1. In a new terminal:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at http://localhost:3000

## API Endpoints
- POST /api/portfolio/add - Add new stock or update existing
- POST /api/portfolio/remove - Remove stock shares
- GET /api/portfolio/summary - Get portfolio summary
- GET /api/performance/metrics - Get performance metrics
- GET /api/performance/history - Get historical performance data 