import { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { portfolioApi, StockTransaction } from '../services/api';
import { useRouter } from 'next/router';

export default function EntryPage() {
  const [transaction, setTransaction] = useState<StockTransaction>({
    symbol: '',
    shares: 0,
    price: 0
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof StockTransaction) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'symbol' 
      ? event.target.value.toUpperCase()
      : parseFloat(event.target.value);
    
    setTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStock = async () => {
    try {
      const result = await portfolioApi.addStock(transaction);
      setMessage({ type: 'success', text: result.message });
      setTransaction({ symbol: '', shares: 0, price: 0 });
      setOpenDialog(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add stock' });
    }
  };

  const handleRemoveStock = async () => {
    try {
      const result = await portfolioApi.removeStock(transaction);
      setMessage({ type: 'success', text: result.message });
      setTransaction({ symbol: '', shares: 0, price: 0 });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove stock' });
    }
  };

  const handleCloseDialog = (addMore: boolean) => {
    setOpenDialog(false);
    if (!addMore) {
      router.push('/portfolio');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Entry
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Stock Symbol"
              value={transaction.symbol}
              onChange={handleInputChange('symbol')}
              placeholder="e.g., AAPL"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Shares"
              value={transaction.shares}
              onChange={handleInputChange('shares')}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Price per Share"
              value={transaction.price}
              onChange={handleInputChange('price')}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddStock}
              disabled={!transaction.symbol || transaction.shares <= 0 || transaction.price <= 0}
            >
              Add Stock
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleRemoveStock}
              disabled={!transaction.symbol || transaction.shares <= 0 || transaction.price <= 0}
            >
              Remove Stock
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert 
          onClose={() => setMessage(null)} 
          severity={message?.type} 
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={() => handleCloseDialog(false)}
        aria-labelledby="add-more-dialog-title"
        aria-describedby="add-more-dialog-description"
      >
        <DialogTitle id="add-more-dialog-title">{"Stock Added Successfully!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="add-more-dialog-description">
            Do you want to add more stocks?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog(false)} color="primary">
            No, Go to Portfolio
          </Button>
          <Button onClick={() => handleCloseDialog(true)} color="primary" autoFocus>
            Yes, Add More
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 