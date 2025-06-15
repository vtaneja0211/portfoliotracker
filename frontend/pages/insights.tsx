import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { portfolioApi } from '../services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface PortfolioInsights {
  total_value: number;
  stock_allocation: { [key: string]: number };
  stock_values: { [key: string]: number };
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await portfolioApi.getPortfolioInsights();
        if (data.status === 'success') {
          setInsights(data);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!insights) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Failed to load insights
        </Typography>
      </Container>
    );
  }

  const stockAllocationData = {
    labels: Object.keys(insights.stock_allocation),
    datasets: [
      {
        data: Object.values(insights.stock_allocation),
        backgroundColor: [
          '#0A84FF', // Primary Blue
          '#32D74B', // Success Green
          '#FF9F0A', // Secondary Orange
          '#64D3EB', // Teal
          '#BF5AF2', // Purple
          '#FF453A', // Error Red
          '#C7C7CC', // Light Gray
          '#5E5E5E', // Medium Gray
          '#3A3A3C', // Darker Gray
        ],
        borderColor: '#1C1C1E',
        borderWidth: 2,
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Portfolio Insights
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              Total Portfolio Value: ${insights.total_value.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Stock Allocation
            </Typography>
            <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie
                data={stockAllocationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#E0E0E0',
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed !== null) {
                              label += context.parsed.toFixed(1) + '%';
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Paper sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Top Holdings
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(insights.stock_values)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([symbol, value]) => (
                  <Grid item xs={12} sm={6} key={symbol}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <ShowChartIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{symbol}</Typography>
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insights.total_value > 0 ? ((value / insights.total_value) * 100).toFixed(1) : 0}% of portfolio
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 