import { AppBar, Toolbar, Typography, Button, Container } from '../../node_modules/@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⬅️ підключаємо AuthContext

function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth(); // ⬅️ Витягуємо з контексту
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();           // ⬅️ очищення стейтів та запит до бекенду
    navigate('/login');       // ⬅️ редірект на логін
  };


  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/workers/run"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Ads Project
          </Typography>
          {isAuthenticated ? (
            <>
              {/* <Typography variant="body1" sx={{ marginRight: 2 }}>
                {user.username}
              </Typography> */}

              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>

              <Button color="inherit" component={RouterLink} to="/workers/run">
                Run Worker
              </Button>

              <Button color="inherit" component={RouterLink} to="/workers/settings">
                Worker Settings
              </Button>

              <Button color="inherit" component={RouterLink} to="/data">
                Data
              </Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}

        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default AppLayout;
