// WorkerCard.jsx
import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Schedule,
  MoreVert,
  AccessTime,
  Link as LinkIcon
} from '@mui/icons-material';

function WorkerCard({ profile, isProfileCreatePage, onEdit, onDelete, onRun, onToggleActive }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(profile);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(profile.id);
  };

  const handleToggleChange = (event) => {
    event.stopPropagation();
    if (onToggleActive) onToggleActive(profile);
  };

  const getScheduleTypeConfig = () => {
    switch (profile.schedule_type) {
      case 'manual':
        return { color: 'primary', label: 'Мануальний' };
      case 'scheduled_once':
        return { color: 'secondary', label: 'Одноразовий' };
      case 'interval':
        return { color: 'success', label: 'Інтервальний' };
      case 'daily':
        return { color: 'info', label: 'Щоденний' };
      default:
        return { color: 'default', label: profile.schedule_type };
    }
  };

  const getStatusConfig = () => {
    switch (profile.current_status) {
      case 'success':
        return { color: 'success', label: 'Успішний' };
      case 'failed':
        return { color: 'error', label: 'Помилка' };
      case 'running':
        return { color: 'info', label: 'Виконується' };
      case 'pending':
        return { color: 'warning', label: 'Очікування' };
      default:
        return { color: 'default', label: 'Ніколи' };
    }
  };

  const scheduleConfig = getScheduleTypeConfig();
  const statusConfig = getStatusConfig();

  const formatLastRun = (lastRun) => {
    if (!lastRun) return 'Ніколи';
    const date = new Date(lastRun);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 320,
        width: '100%',
        transition: 'all 0.3s ease',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header with name and menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.2,
            }}
          >
            {profile.name}
          </Typography>

          {isProfileCreatePage ?
            (<>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', mt: -0.5, mr: -0.5 }}
                onClick={handleMenuOpen}
              >
                <MoreVert fontSize="small" />
              </IconButton>


              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                paper={{
                  sx: {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
                  Редагувати
                </MenuItem>
                <MenuItem
                  onClick={handleDelete}
                  sx={{ fontSize: '0.875rem', color: 'error.main' }}
                >
                  Видалити
                </MenuItem>
              </Menu>
            </>) : null}

        </Box>

        {/* URL */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <LinkIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              maxWidth: '100%',
              display: 'inline-block'
            }}
            title={profile.filter_url}
          >
            {profile.filter_url.replace('https://', '').slice(0, 10)}...
          </Typography>
        </Box>

        {/* Status Chips */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={scheduleConfig.label}
            color={scheduleConfig.color}
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
          <Chip
            size="small"
            label={statusConfig.label}
            color={statusConfig.color}
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
        </Box>

        {/* Status или Toggle в залежності від сторінки */}
        {isProfileCreatePage ? (
          /* На основній сторінці показуємо тумблер */
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.is_active}
                  onChange={handleToggleChange}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'success.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'success.main',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  {profile.is_active ? 'Активний' : 'Неактивний'}
                </Typography>
              }
            />
          </Box>
        ) : (
          /* На сторінці створення показуємо статус чіпом */
          <Box sx={{ mb: 2 }}>
            <Chip
              label={profile.is_active ? 'Активний' : 'Неактивний'}
              color={profile.is_active ? 'success' : 'default'}
              size="small"
              sx={{ fontSize: '0.8rem' }}
            />
          </Box>
        )}

        {/* Last Run Info */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 2.5,
          p: 1,
          bgcolor: 'grey.50',
          borderRadius: 1,
        }}>
          <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            Останній запуск: {formatLastRun(profile.last_run_at)}
          </Typography>
        </Box>

        {/* Action Button */}
        {profile.schedule_type === 'manual' ? (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            fullWidth
            onClick={() => onRun(profile.id)}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              fontSize: '0.9rem',
              mt: 2,
            }}
          >
            Запустити
          </Button>
        ) : (
          <Chip
            label="Автоматичний запуск"
            sx={{
              mt: 2,
              bgcolor: 'success.50',
              border: '1px dashed',
              borderColor: 'success.main',
              color: 'success.main',
              fontWeight: 500,
            }}
          />
        )}
      </CardContent>
    </Card >
  );
}

export default WorkerCard;