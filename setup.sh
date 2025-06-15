#!/bin/bash

# Create virtual environment for backend
python -m venv venv
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Initialize frontend
cd frontend
npm install
cd ..

# Handle Alpha Vantage key for stock data API
echo ""
echo "--- Alpha Vantage API Key Setup ---"
if [ -z "$ALPHAVANTAGE_KEY" ]; then
  read -p "Enter your Alpha Vantage API key: " ALPHAVANTAGE_KEY
fi

# Write the key to backend/.env
echo "ALPHAVANTAGE_KEY=$ALPHAVANTAGE_KEY" > backend/.env
echo "Alpha Vantage key saved to backend/.env."

echo ""
echo "Setup complete! To start the application:"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   source ../venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev" 