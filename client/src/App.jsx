import { useState, useEffect } from 'react';
import MetricChart from './MetricChart';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Chip,
} from '@mui/material';

const materialNames = {
  lumber: 'Lumber and wood products',
  steel: 'Iron and steel',
  concrete: 'Concrete products',
};

function App() {
  // Selected filters and API data
  const [material, setMaterial] = useState('lumber');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('12m');

  // AI Analyst
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch data when the material changes
  useEffect(() => {
    async function fetchMaterialData() {
      setLoading(true);
      setError(null);
      setData([]);

      try {
        const response = await fetch(
          `http://localhost:3001/api/materials/${material}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch material data');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMaterialData();
  }, [material]);

  // Filter data based on the selected date range
  const filterDataByDate = () => {
    if (data.length === 0) return [];

    if (dateRange === 'all') return data;

    const months = {
      '6m': 6,
      '12m': 12,
      '5y': 60,
      '10y': 120,
    };

    return data.slice(-months[dateRange]);
  };

  const filteredData = filterDataByDate();

  // Choose X-axis labels based on the date range
  const getXAxisTicks = () => {
    if (filteredData.length === 0) return [];

    if (dateRange === '6m') {
      return filteredData.map((item) => item.date);
    }

    if (dateRange === '12m') {
      return filteredData
        .filter((item, index) => index % 2 === 0)
        .map((item) => item.date);
    }

    const interval = dateRange === 'all' ? 10 : 1;

    return filteredData
      .filter((item) => {
        const [year, month] = item.date.split('-');

        return Number(month) === 1 && Number(year) % interval === 0;
      })
      .map((item) => item.date);
  };

  const xAxisTicks = getXAxisTicks();

  // Format dates for chart labels
  const formatDate = (date) => {
    if (dateRange === '6m' || dateRange === '12m') {
      const [year, month] = date.split('-');

      const monthName = new Date(
        Number(year),
        Number(month) - 1
      ).toLocaleString('en-US', { month: 'short' });

      return `${monthName} '${year.slice(2)}`;
    }

    return date.substring(0, 4);
  };

  const latestData = data.length > 0 ? data[data.length - 1] : null;

  // Shared styling
  const cardStyle = {
    borderRadius: 3,
    border: '1px solid #e0e6ed',
    boxShadow: 'none',
    bgcolor: '#ffffff',
  };

  const toggleButtonStyle = {
    bgcolor: '#e9edf2',
    borderRadius: 2,
    p: 0.5,
    '& .MuiToggleButton-root': {
      border: 'none',
      borderRadius: '8px !important',
      textTransform: 'none',
      px: 2,
      color: '#243447',
      '&.Mui-selected': {
        bgcolor: '#243447',
        color: 'white',
        '&:hover': {
          bgcolor: '#34495e',
        },
      },
    },
  };

  const suggestedQuestions = [
    {
      label: 'Compare trends',
      question: 'Compare recent price trends across materials.',
    },
    {
      label: 'Analyze volatility',
      question: 'Is the selected material unusually volatile?',
    },
    {
      label: 'Best time to buy',
      question: 'When is a good time to purchase this material?',
    },
  ];


  // Send a question to the AI Analyst
  const handleAskAI = async (selectedQuestion = question) => {
    const text = selectedQuestion.trim();

    if (!text || aiLoading) return;

    setAiLoading(true);
    setAiError('');
    setQuestion('');

    setShowSuggestions(false);

    try {
      const response = await fetch('http://localhost:3001/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
          material,
          dateRange,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to generate AI insights right now.');
      }

      const result = await response.json();

      setMessages((previous) => [
        ...previous,
        { role: 'user', content: text },
        { role: 'assistant', content: result.answer },
      ]);
    } catch (error) {
      setAiError(error.message);
      setQuestion(text);
    } finally {
      setAiLoading(false);
    }
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fb' }}>
      {/* Dashboard header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          px: 3,
          py: 2.5,
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#17232f' }}>
          Construction Material Price Tracker
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Producer price indexes from FRED
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>

        {/* Material and date range controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <ToggleButtonGroup
            value={material}
            exclusive
            onChange={(event, newMaterial) => {
              if (newMaterial !== null) {
                setMaterial(newMaterial);
              }
            }}
            sx={toggleButtonStyle}
          >
            <ToggleButton value="lumber">
              Lumber & Wood
            </ToggleButton>

            <ToggleButton value="steel">
              Iron & Steel
            </ToggleButton>

            <ToggleButton value="concrete">
              Concrete Products
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(event, newRange) => {
              if (newRange !== null) {
                setDateRange(newRange);
              }
            }}
            sx={toggleButtonStyle}
          >
            <ToggleButton value="6m">6M</ToggleButton>
            <ToggleButton value="12m">12M</ToggleButton>
            <ToggleButton value="5y">5Y</ToggleButton>
            <ToggleButton value="10y">10Y</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Main chart and AI Analyst */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          {/* Price Index chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ ...cardStyle, height: 470 }}>
              <CardContent
                sx={{
                  p: 3,
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:last-child': { pb: 3 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Price Index
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Producer price index, {materialNames[material]}.
                      Hover for exact values.
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Latest index
                    </Typography>

                    <Typography variant="h6" fontWeight="bold">
                      {latestData && !loading
                        ? Number(latestData.value).toFixed(2)
                        : '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                  {loading ? (
                    <Typography>Loading chart...</Typography>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={filteredData}
                        margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          stroke="#e5eaf0"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          ticks={xAxisTicks}
                          tickFormatter={formatDate}
                          tick={{ fontSize: 11, fill: '#617083' }}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                        />

                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 11, fill: '#617083' }}
                          tickLine={false}
                          axisLine={false}
                          width={55}
                        />

                        <Tooltip
                          formatter={(value) => [
                            Number(value).toFixed(2),
                            'Price Index',
                          ]}
                        />

                        <Area
                          type="linear"
                          dataKey="value"
                          stroke="#2f6fe4"
                          strokeWidth={2.5}
                          fill="#2f6fe4"
                          fillOpacity={0.09}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Analyst panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ ...cardStyle, height: 470 }}>
              <CardContent
                sx={{
                  p: 3,
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:last-child': { pb: 3 },
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  AI Analyst
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Ask about the material and dates you have selected.
                </Typography>

                {/* AI conversation */}
                <Box
                  sx={{
                    bgcolor: '#f4f6f9',
                    borderRadius: 2,
                    p: 2,
                    mt: 2,
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                  }}
                >
                  {messages.length === 0 && !aiLoading && (
                    <Typography variant="body2" color="text.secondary">
                      Ask a question about historical price trends, seasonal
                      patterns, or construction material purchasing decisions.
                    </Typography>
                  )}


                  {messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent:
                          message.role === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: message.role === 'user' ? '85%' : '100%',
                          minWidth: 0,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            message.role === 'user' ? '#e3efff' : '#f4f5f7',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 700,
                            mb: 0.5,
                            color: 'text.secondary',
                          }}
                        >
                          {message.role === 'user' ? 'YOU' : 'AI ANALYST'}
                        </Typography>

                        {message.role === 'user' ? (
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              fontSize: 14,
                              lineHeight: 1.6,
                              minWidth: 0,
                              maxWidth: '100%',
                              overflowWrap: 'anywhere',

                              '& p': { my: 1 },
                              '& ul, & ol': { pl: 2.5 },

                              '& table': {
                                display: 'block',
                                width: '100%',
                                overflowX: 'auto',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                              },

                              '& th, & td': {
                                minWidth: 100,
                                padding: '8px 12px',
                                textAlign: 'left',
                                verticalAlign: 'top',
                                whiteSpace: 'normal',
                                overflowWrap: 'normal',
                                wordBreak: 'normal',
                                borderBottom: '1px solid #e0e0e0',
                              },

                              '& th': {
                                fontWeight: 600,
                                backgroundColor: '#e9ebef',
                              },
                            }}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}

                  {aiLoading && (
                    <Typography variant="body2" color="text.secondary">
                      Analyzing material data...
                    </Typography>
                  )}

                  {aiError && (
                    <Typography variant="body2" color="error">
                      {aiError}
                    </Typography>
                  )}
                </Box>



                {/* Question input and suggestions */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Ask about this data"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleAskAI();
                        }
                      }}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      title="Suggested questions"
                      sx={{ minWidth: 40, px: 1 }}
                    >
                      <LightbulbOutlinedIcon />
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => handleAskAI()}
                      disabled={aiLoading || !question.trim()}
                    >
                      Ask
                    </Button>
                  </Box>

                  {showSuggestions && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {suggestedQuestions.map((suggestion) => (
                        <Chip
                          key={suggestion.label}
                          label={suggestion.label}
                          variant="outlined"
                          size="small"
                          clickable
                          disabled={aiLoading}
                          onClick={() => handleAskAI(suggestion.question)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* MoM, YoY, and volatility charts */}
        <Grid container spacing={2.5}>
          {[
            {
              title: 'Month-over-Month Change',
              description: 'Percent change from the previous month',
              dataKey: 'MoM',
              color: '#2f6fe4',
            },
            {
              title: 'Year-over-Year Change',
              description: 'Percent change from the same month a year earlier',
              dataKey: 'YoY',
              color: '#2f6fe4',
            },
            {
              title: '12-Month Rolling Volatility',
              description: 'Variation in monthly price changes over the trailing 12 months',
              dataKey: 'volatility',
              color: '#405367',
            },
          ].map((chart) => (
            <Grid key={chart.dataKey} size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...cardStyle, height: 285 }}>
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': { pb: 2.5 },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {chart.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {chart.description}
                  </Typography>

                  {loading ? (
                    <Typography>Loading chart...</Typography>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : (
                    <MetricChart
                      data={filteredData}
                      dataKey={chart.dataKey}
                      color={chart.color}
                      dateRange={dateRange}
                      xAxisTicks={xAxisTicks}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
