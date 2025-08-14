import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function WorkerCard({ profile, isProfileCreatePage, onEdit, onDelete, onToggleActive, onRun }) {
  const getChipColor = (type) => {
    switch (type) {
      case 'manual': return 'default';
      case 'daily': return 'primary';
      case 'interval': return 'success';
      case 'scheduled_once': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'info';
      case 'running': return 'warning';
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'never':
      default: return 'default';
    }
  };

  return (
    <Card sx={{ minWidth: 275, p: 2, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {profile.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            wordBreak: 'break-all',
            maxWidth: '100%',
            display: 'inline-block'
          }}
          title={profile.filter_url}
        >
          {profile.filter_url.replace('https://', '').slice(0, 10)}...
        </Typography>

        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          <Chip
            label={profile.schedule_type}
            color={getChipColor(profile.schedule_type)}
            size="small"
          />

          <Chip
            label={profile.current_status === 'never' ? 'Ніколи не запускалось' : profile.current_status}
            color={getStatusColor(profile.current_status)}
            size="small"
          />

          {isProfileCreatePage ? (
            <FormControlLabel
              control={
                <Switch
                  checked={profile.is_active}
                  onChange={() => onToggleActive?.(profile)}
                />
              }
              label={profile.is_active ? 'Активний' : 'Неактивний'}
            />
          ) : (
            <Chip
              label={profile.is_active ? 'Активний' : 'Неактивний'}
              color={profile.is_active ? 'success' : 'default'}
              size="small"
            />
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }}>
        {isProfileCreatePage ? (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit?.(profile)}
              startIcon={<span>✏️</span>}
            >
              Редагувати
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete?.(profile.id)}
              startIcon={<span>🗑️</span>}
            >
              Видалити
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => onRun?.(profile.id)}
            disabled={!profile.is_active}
          >
            Запустити
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default WorkerCard;
