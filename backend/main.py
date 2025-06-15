from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from portfolio import PortfolioManager
from performance import PerformanceAnalyzer

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Allow both localhost and 127.0.0.1
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
portfolio_manager = PortfolioManager()
performance_analyzer = PerformanceAnalyzer(portfolio_manager)

class StockTransaction(BaseModel):
    symbol: str
    shares: float
    price: float

@app.post("/api/portfolio/add")
async def add_stock(transaction: StockTransaction):
    result = portfolio_manager.add_stock(
        transaction.symbol,
        transaction.shares,
        transaction.price
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.post("/api/portfolio/remove")
async def remove_stock(transaction: StockTransaction):
    result = portfolio_manager.remove_stock(
        transaction.symbol,
        transaction.shares,
        transaction.price
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.get("/api/portfolio/summary")
async def get_portfolio_summary():
    return portfolio_manager.get_portfolio_summary()

@app.get("/api/performance/metrics")
async def get_performance_metrics():
    return performance_analyzer.get_portfolio_performance()

@app.get("/api/performance/insights")
async def get_portfolio_insights():
    return performance_analyzer.get_portfolio_insights()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 