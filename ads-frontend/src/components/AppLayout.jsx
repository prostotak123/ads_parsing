import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Ads Project
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
          <Button color="inherit" component={RouterLink} to="/workers/settings">
            Worker Settings
          </Button>
          <Button color="inherit" component={RouterLink} to="/workers/run">
            Run Worker
          </Button>
          <Button color="inherit" component={RouterLink} to="/data">
            Data
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default AppLayout;
