import os
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, List
from portfolio import PortfolioManager

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
ALPHAVANTAGE_KEY = os.getenv('ALPHAVANTAGE_KEY')

PERIOD_DAYS = {
    '1d': 1,
    '5d': 5,
    '1m': 22,   # Approximate trading days in a month
    '6m': 126,  # 21*6
    '1y': 252,  # Approximate trading days in a year
    '5y': 1260, # 252*5
}

class PerformanceAnalyzer:
    def __init__(self, portfolio_manager: PortfolioManager):
        self.portfolio_manager = portfolio_manager
        self._daily_series_cache = {}
        self._last_cache_update = None
        self._cache_duration = timedelta(hours=1)  # Cache for 1 hour

    def _should_update_cache(self):
        if not self._last_cache_update:
            return True
        return datetime.now() - self._last_cache_update > self._cache_duration

    def _update_cache(self, symbols: List[str]):
        if not self._should_update_cache():
            return

        for symbol in symbols:
            if symbol not in self._daily_series_cache or self._should_update_cache():
                series = self.fetch_daily_series(symbol)
                if series:
                    self._daily_series_cache[symbol] = series
        
        self._last_cache_update = datetime.now()

    def fetch_daily_series(self, symbol: str):
        url = f'https://www.alphavantage.co/query'
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'outputsize': 'full',
            'apikey': ALPHAVANTAGE_KEY
        }
        r = requests.get(url, params=params)
        data = r.json()
        return data.get('Time Series (Daily)', {})

    def get_current_price(self, symbol: str) -> float:
        """Get current price from cached daily series data"""
        if symbol not in self._daily_series_cache:
            self._update_cache([symbol])
        
        series = self._daily_series_cache.get(symbol, {})
        if not series:
            return 0.0
        
        # Get the most recent date's closing price
        dates = sorted(series.keys(), reverse=True)
        if not dates:
            return 0.0
            
        return float(series[dates[0]]['4. close'])

    def get_stock_performance(self, symbol: str, period: str) -> dict:
        try:
            if symbol not in self._daily_series_cache:
                self._update_cache([symbol])
                
            series = self._daily_series_cache.get(symbol, {})
            if not series:
                return {"status": "error", "message": f"No data for {symbol}"}
                
            dates = sorted(series.keys(), reverse=True)
            end_date = dates[0]
            end_price = float(series[end_date]['4. close'])

            if period == 'ytd':
                jan1 = datetime(datetime.now().year, 1, 1)
                closest_date = min(dates, key=lambda d: abs(datetime.strptime(d, '%Y-%m-%d') - jan1))
                start_price = float(series[closest_date]['4. close'])
            else:
                days = PERIOD_DAYS.get(period, 22)
                if len(dates) > days:
                    start_date = dates[days]
                else:
                    start_date = dates[-1]
                start_price = float(series[start_date]['4. close'])

            abs_perf = end_price - start_price
            pct_perf = ((end_price - start_price) / start_price) * 100 if start_price != 0 else 0
            return {
                "status": "success",
                "symbol": symbol,
                "period": period,
                "start_price": start_price,
                "end_price": end_price,
                "performance": pct_perf,
                "absolute_performance": abs_perf,
                "data_points": [float(series[d]['4. close']) for d in dates[:PERIOD_DAYS.get(period, 22)+1]]
            }
        except Exception as e:
            return {"status": "error", "message": f"Error fetching data for {symbol}: {str(e)}"}

    def get_portfolio_performance(self) -> dict:
        portfolio = self.portfolio_manager.get_portfolio_summary()
        if portfolio["status"] != "success":
            return portfolio

        # Update cache for all symbols at once
        symbols = list(portfolio["portfolio"].keys())
        self._update_cache(symbols)

        periods = {
            "1d": "1 day",
            "5d": "5 days",
            "1m": "1 month",
            "6m": "6 months",
            "1y": "1 year",
            "5y": "5 years",
            "ytd": "Year to date"
        }

        performance_data = {}
        for symbol in symbols:
            performance_data[symbol] = {}
            for period, period_name in periods.items():
                result = self.get_stock_performance(symbol, period)
                if result["status"] == "success":
                    performance_data[symbol][period_name] = result

        return {
            "status": "success",
            "performance": performance_data
        }

    def get_portfolio_insights(self) -> dict:
        portfolio = self.portfolio_manager.get_portfolio_summary()
        if portfolio["status"] != "success":
            return portfolio

        # Update cache for all symbols at once
        symbols = list(portfolio["portfolio"].keys())
        self._update_cache(symbols)

        total_value = 0
        start_of_year_total = 0
        stock_values = {}
        for symbol, data in portfolio["portfolio"].items():
            current_price = self.get_current_price(symbol)
            value = current_price * data["total_shares"]
            stock_values[symbol] = value
            total_value += value
            start_of_year_total += data.get("start_of_year_total", 0)

        allocation = {}
        for symbol, value in stock_values.items():
            allocation[symbol] = (value / total_value) * 100 if total_value > 0 else 0

        sector_allocation = {"Unknown": 100.0}

        return {
            "status": "success",
            "total_value": total_value,
            "start_of_year_total": start_of_year_total,
            "stock_allocation": allocation,
            "sector_allocation": sector_allocation,
            "stock_values": stock_values
        } 