import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  CircularProgress,
  IconButton,
  Collapse,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { portfolioApi, StockTransaction } from '../services/api';
import { useRouter } from 'next/router';

interface StockData {
  total_shares: number;
  total_cost: number;
  average_price: number;
  holding_type: 'stock' | 'cash';
  start_of_year_total?: number;
  lots: Array<{
    shares: number;
    purchase_price: number;
    purchase_date: string;
    start_of_year_price?: number;
  }>;
}

interface PerformancePeriod {
  performance: number;
  absolute_performance?: number;
  start_price: number;
  end_price: number;
}

interface PerformanceData {
  [key: string]: {
    [key: string]: PerformancePeriod;
  };
}

const periodHeaders = [
  { key: '1 day', label: '1D' },
  { key: '5 days', label: '5D' },
  { key: '1 month', label: '1M' },
  { key: '6 months', label: '6M' },
  { key: '1 year', label: '1Y' },
  { key: '5 years', label: '5Y' },
];

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<{ [key: string]: StockData }>({});
  const [performance, setPerformance] = useState<PerformanceData>({});
  const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'add' | 'remove' | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [transactionShares, setTransactionShares] = useState(0);
  const [transactionPrice, setTransactionPrice] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [transaction, setTransaction] = useState<StockTransaction>({
    symbol: '',
    shares: 0,
    price: 0,
    holding_type: 'stock'
  });
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [portfolioData, performanceData, insightsData] = await Promise.all([
        portfolioApi.getPortfolioSummary(),
        portfolioApi.getPerformanceMetrics(),
        portfolioApi.getPortfolioInsights()
      ]);

      if (portfolioData.status === 'success') {
        setPortfolio(portfolioData.portfolio);
      }
      if (performanceData.status === 'success') {
        setPerformance(performanceData.performance);
      }
      if (insightsData.status === 'success') {
        setCurrentPrices(
          Object.fromEntries(
            Object.entries(insightsData.stock_values).map(([symbol, value]) => {
              const shares = portfolioData.portfolio[symbol]?.total_shares;
              const numValue = typeof value === 'number' ? value : 0;
              const numShares = typeof shares === 'number' && shares > 0 ? shares : 1;
              return [symbol, numValue / numShares];
            })
          )
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (symbol: string) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [symbol]: !prevOpenRows[symbol],
    }));
  };

  const handleOpenTransactionDialog = (symbol: string, type: 'add' | 'remove') => {
    setCurrentSymbol(symbol);
    setTransactionType(type);
    setTransactionShares(0);
    setTransactionPrice(0);
    setTransaction(prev => ({ 
      ...prev, 
      holding_type: portfolio[symbol].holding_type as 'stock' | 'cash' 
    }));
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
    setTransactionType(null);
    setCurrentSymbol('');
    setTransactionShares(0);
    setTransactionPrice(0);
  };

  const handleTransactionSubmit = async () => {
    const transaction: StockTransaction = {
      symbol: currentSymbol,
      shares: transactionShares,
      price: transactionPrice,
    };

    try {
      let result;
      if (transactionType === 'add') {
        result = await portfolioApi.addStock(transaction);
      } else if (transactionType === 'remove') {
        result = await portfolioApi.removeStock(transaction);
      }
      setSnackbarMessage({ type: 'success', text: result?.message || 'Transaction successful!' });
      fetchData();
    } catch (error: any) {
      setSnackbarMessage({ type: 'error', text: error.response?.data?.detail || 'Transaction failed!' });
    } finally {
      handleCloseTransactionDialog();
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => router.push('/entry')}>
          Add New Stock
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="portfolio table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Avg Price</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Current Total</TableCell>
                  <TableCell align="right">Absolute Change ($)</TableCell>
                  <TableCell align="right">% Change</TableCell>
                  <TableCell align="right">Start of Year Total</TableCell>
                  <TableCell align="right">YTD Abs Change ($)</TableCell>
                  <TableCell align="right">YTD % Change</TableCell>
                  {periodHeaders.map((period) => (
                    <TableCell align="right" key={period.key}>{period.label} (%)</TableCell>
                  ))}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(portfolio).map(([symbol, data]) => {
                  const avgPrice = data.average_price;
                  const currPrice = currentPrices[symbol] || 0;
                  const totalCost = data.total_cost;
                  const currentTotal = currPrice * data.total_shares;
                  const absChange = currentTotal - totalCost;
                  const pctChange = totalCost !== 0 ? ((currentTotal - totalCost) / totalCost) * 100 : 0;
                  const startOfYearTotal = data.start_of_year_total || 0;
                  const ytdAbsChange = currentTotal - startOfYearTotal;
                  const ytdPctChange = startOfYearTotal !== 0 ? ((currentTotal - startOfYearTotal) / startOfYearTotal) * 100 : 0;

                  return (
                    <>
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleRowClick(symbol)}
                          >
                            {openRows[symbol] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {data.holding_type === 'stock' ? <ShowChartIcon fontSize="small" color="primary" /> : <AttachMoneyIcon fontSize="small" color="primary" />}
                            {symbol}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{data.total_shares.toFixed(2)}</TableCell>
                        <TableCell align="right">${avgPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">${totalCost.toFixed(2)}</TableCell>
                        <TableCell align="right">${currPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">${currentTotal.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: absChange >= 0 ? 'success.main' : 'error.main' }}>
                          {absChange.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: pctChange >= 0 ? 'success.main' : 'error.main' }}>
                          {pctChange.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">${startOfYearTotal.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: ytdAbsChange >= 0 ? 'success.main' : 'error.main' }}>
                          {ytdAbsChange.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: ytdPctChange >= 0 ? 'success.main' : 'error.main' }}>
                          {ytdPctChange.toFixed(2)}%
                        </TableCell>
                        {periodHeaders.map((period) => {
                          const perf = performance[symbol]?.[period.key];
                          return (
                            <TableCell align="right" key={period.key + '-pct'} sx={{ color: (perf?.performance || 0) >= 0 ? 'success.main' : 'error.main' }}>
                              {perf?.performance !== undefined ? perf.performance.toFixed(2) + '%' : '-'}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenTransactionDialog(symbol, 'add')}
                            size="small"
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleOpenTransactionDialog(symbol, 'remove')}
                            size="small"
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={14}>
                          <Collapse in={openRows[symbol]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Transaction History
                              </Typography>
                              <Table size="small" aria-label="lots">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Shares</TableCell>
                                    <TableCell align="right">Purchase Price</TableCell>
                                    <TableCell align="right">Total Lot Cost</TableCell>
                                    <TableCell align="right">Current Price</TableCell>
                                    <TableCell align="right">Current Lot Value</TableCell>
                                    <TableCell align="right">Abs Lot Change ($)</TableCell>
                                    <TableCell align="right">% Lot Change</TableCell>
                                    <TableCell align="right">Start of Year Price</TableCell>
                                    <TableCell align="right">YTD Abs Lot Change ($)</TableCell>
                                    <TableCell align="right">YTD % Lot Change</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.lots.map((lot, lotIndex) => {
                                    const lotTotalCost = lot.shares * lot.purchase_price;
                                    const lotCurrentValue = currPrice * lot.shares;
                                    const lotAbsChange = lotCurrentValue - lotTotalCost;
                                    const lotPctChange = lotTotalCost !== 0 ? ((lotCurrentValue - lotTotalCost) / lotTotalCost) * 100 : 0;
                                    const lotStartOfYearValue = lot.start_of_year_price ? lot.shares * lot.start_of_year_price : 0;
                                    const lotYtdAbsChange = lotCurrentValue - lotStartOfYearValue;
                                    const lotYtdPctChange = lotStartOfYearValue !== 0 ? ((lotCurrentValue - lotStartOfYearValue) / lotStartOfYearValue) * 100 : 0;

                                    return (
                                      <TableRow key={lotIndex}>
                                        <TableCell>{lot.shares.toFixed(2)}</TableCell>
                                        <TableCell align="right">${lot.purchase_price.toFixed(2)}</TableCell>
                                        <TableCell align="right">${lotTotalCost.toFixed(2)}</TableCell>
                                        <TableCell align="right">${currPrice.toFixed(2)}</TableCell>
                                        <TableCell align="right">${lotCurrentValue.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ color: lotAbsChange >= 0 ? 'success.main' : 'error.main' }}>
                                          {lotAbsChange.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: lotPctChange >= 0 ? 'success.main' : 'error.main' }}>
                                          {lotPctChange.toFixed(2)}%
                                        </TableCell>
                                        <TableCell align="right">${lot.start_of_year_price?.toFixed(2) || '-'}</TableCell>
                                        <TableCell align="right" sx={{ color: lotYtdAbsChange >= 0 ? 'success.main' : 'error.main' }}>
                                          {lotYtdAbsChange.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: lotYtdPctChange >= 0 ? 'success.main' : 'error.main' }}>
                                          {lotYtdPctChange.toFixed(2)}%
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog}>
        <DialogTitle>{transactionType === 'add' ? `Add Shares for ${currentSymbol}` : `Remove Shares for ${currentSymbol}`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shares"
            type="number"
            fullWidth
            variant="standard"
            value={transactionShares}
            onChange={(e) => setTransactionShares(parseFloat(e.target.value))}
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price per Share"
            type="number"
            fullWidth
            variant="standard"
            value={transactionPrice}
            onChange={(e) => setTransactionPrice(parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button
            onClick={handleTransactionSubmit}
            disabled={!transactionShares || !transactionPrice}
          >
            {transactionType === 'add' ? 'Add' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarMessage?.type}
          sx={{ width: '100%' }}
        >
          {snackbarMessage?.text}
        </Alert>
      </Snackbar>
    </Container>
  );
} 