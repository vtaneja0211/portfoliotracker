import yfinance as yf
print(yf.__version__)
ticker = yf.Ticker("AAPL")
print(ticker.history(period='1mo'))