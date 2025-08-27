import { Grid, Box, Typography } from '@mui/material';
import WorkerCard from './WorkerCard';

function WorkerList({ workers, isProfileCreatePage, onEdit, onDelete, onRun, onToggleActive }) {
  if (!workers || workers.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Немає профілів для відображення
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Створіть перший профіль воркера для початку роботи
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} mt={2}>
      {workers.map((profile) => (
        <Grid key={profile.id}>
          <WorkerCard
            profile={profile}
            isProfileCreatePage={isProfileCreatePage}
            onEdit={onEdit}
            onDelete={onDelete}
            onRun={onRun}
            onToggleActive={onToggleActive}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default WorkerList;