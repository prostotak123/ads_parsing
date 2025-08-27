import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⬅️ підключаємо AuthContext
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  PlayArrow,
  DataUsage,
  Help,
  Menu as MenuIcon,
} from '@mui/icons-material';

function ModernAppLayout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  
  // 🔹 ВАШ КОД:
  const { isAuthenticated, user, logout } = useAuth(); // ⬅️ Витягуємо з контексту
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // 🔹 ВАШ LOGOUT HANDLER:
  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();           // ⬅️ очищення стейтів та запит до бекенду
    navigate('/login');       // ⬅️ редірект на логін
  };

  const navigationItems = [
    { path: '/workers/run', label: 'Run Worker', icon: <PlayArrow fontSize="small" /> },
    { path: '/workers/settings', label: 'Worker Settings', icon: <Settings fontSize="small" /> },
    // { path: '/data', label: 'Data', icon: <DataUsage fontSize="small" /> },
    { path: '/help', label: 'Instruction', icon: <Help fontSize="small" /> },
  ];

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              component={RouterLink}
              to="/workers/run"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                  A
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ads Project
              </Typography>
            </Box>
          </Box>

          {/* 🔹 ВАШ УСЛОВНИЙ РЕНДЕРИНГ: */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary',
                      bgcolor: isActiveRoute(item.path) 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* Status Indicator */}
              <Chip
                label="Online"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                  fontWeight: 500,
                  mr: 1,
                  display: { xs: 'none', sm: 'flex' },
                }}
              />

              {/* Profile Menu */}
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0,
                  ml: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Box>
                
                {/* Mobile Navigation */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {navigationItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      onClick={handleProfileMenuClose}
                      sx={{ 
                        gap: 1,
                        color: isActiveRoute(item.path) ? 'primary.main' : 'text.primary',
                        bgcolor: isActiveRoute(item.path) 
                          ? alpha(theme.palette.primary.main, 0.08) 
                          : 'transparent',
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </MenuItem>
                  ))}
                  <Box sx={{ height: 8 }} />
                </Box>

                <MenuItem onClick={handleLogout} sx={{ gap: 1, color: 'error.main' }}>
                  <Logout fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default ModernAppLayout;