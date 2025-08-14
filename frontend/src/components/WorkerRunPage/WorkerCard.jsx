import { Card, CardContent, Typography, Button, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function WorkerCard({ profile, onRun }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{profile.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Тип: {profile.schedule_type}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Останній запуск: {profile.last_run_at || 'Ніколи'}
        </Typography>

        {profile.schedule_type === 'manual' ? (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{ mt: 2 }}
            onClick={() => onRun(profile.id)}
          >
            Запустити
          </Button>
        ) : (
          <Chip label="Автоматичний запуск" sx={{ mt: 2 }} />
        )}
      </CardContent>
    </Card>
  );
}

export default WorkerCard;
