
import { Box, Drawer, AppBar, Toolbar, Typography, Card, CardContent, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const drawerWidth = 240;

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7fb' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#30475e',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Material Tracker
          </Typography>
        </Box>

        <List>
          {[
            { label: 'Dashboard', icon: <DashboardIcon /> },
            { label: 'Materials', icon: <ShowChartIcon /> },
            { label: 'AI Advisor', icon: <SmartToyIcon /> },
          ].map((item) => (
            <ListItemButton key={item.label}>
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#243447' }}>
          <Toolbar>
            <Typography variant="h6">
              Construction Material Price Tracker
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard Overview
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Monitor construction material price trends.
          </Typography>

          <Grid container spacing={3}>
            {[
              'Price Index',
              'Month-over-Month Change',
              'Year-over-Year Change',
              '12-Month Volatility',
            ].map((title) => (
              <Grid key={title} size={{ xs: 12, md: 6 }}>
                <Card sx={{ minHeight: 280, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {title}
                    </Typography>
                    <Typography color="text.secondary">
                      Chart coming soon...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default App;