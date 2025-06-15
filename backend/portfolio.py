from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class StockLot(Base):
    __tablename__ = "stock_lots"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    shares = Column(Float)
    purchase_price = Column(Float)
    purchase_date = Column(DateTime, default=datetime.utcnow)

class PortfolioManager:
    def __init__(self, db_url: str = "sqlite:///./portfolio.db"):
        self.engine = create_engine(db_url)
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def add_stock(self, symbol: str, shares: float, purchase_price: float) -> dict:
        """Add a new stock lot to the portfolio."""
        db = self.SessionLocal()
        try:
            stock_lot = StockLot(
                symbol=symbol.upper(),
                shares=shares,
                purchase_price=purchase_price
            )
            db.add(stock_lot)
            db.commit()
            return {
                "status": "success",
                "message": f"Added {shares} shares of {symbol} at ${purchase_price:.2f}"
            }
        finally:
            db.close()

    def remove_stock(self, symbol: str, shares: float, sell_price: float) -> dict:
        """Remove shares from the portfolio using FIFO method."""
        db = self.SessionLocal()
        try:
            remaining_shares = shares
            lots = db.query(StockLot).filter(
                StockLot.symbol == symbol.upper(),
                StockLot.shares > 0
            ).order_by(StockLot.purchase_date).all()

            if not lots:
                return {"status": "error", "message": f"No shares found for {symbol}"}

            total_profit = 0
            for lot in lots:
                if remaining_shares <= 0:
                    break
                
                shares_to_remove = min(remaining_shares, lot.shares)
                profit = (sell_price - lot.purchase_price) * shares_to_remove
                total_profit += profit
                
                lot.shares -= shares_to_remove
                remaining_shares -= shares_to_remove

            if remaining_shares > 0:
                return {
                    "status": "error",
                    "message": f"Not enough shares to sell. Only {shares - remaining_shares} shares available."
                }

            db.commit()
            return {
                "status": "success",
                "message": f"Sold {shares} shares of {symbol} at ${sell_price:.2f}",
                "profit": total_profit
            }
        finally:
            db.close()

    def get_portfolio_summary(self) -> dict:
        """Get a summary of the current portfolio."""
        db = self.SessionLocal()
        try:
            lots = db.query(StockLot).filter(StockLot.shares > 0).all()
            
            portfolio = {}
            for lot in lots:
                if lot.symbol not in portfolio:
                    portfolio[lot.symbol] = {
                        "total_shares": 0,
                        "total_cost": 0,
                        "lots": []
                    }
                
                portfolio[lot.symbol]["total_shares"] += lot.shares
                portfolio[lot.symbol]["total_cost"] += lot.shares * lot.purchase_price
                portfolio[lot.symbol]["lots"].append({
                    "shares": lot.shares,
                    "purchase_price": lot.purchase_price,
                    "purchase_date": lot.purchase_date.isoformat()
                })

            # Calculate average prices
            for symbol in portfolio:
                portfolio[symbol]["average_price"] = (
                    portfolio[symbol]["total_cost"] / portfolio[symbol]["total_shares"]
                )

            return {
                "status": "success",
                "portfolio": portfolio
            }
        finally:
            db.close() 