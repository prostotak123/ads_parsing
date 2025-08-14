import { Grid } from '@mui/material';
import WorkerCard from './WorkerCard';

function WorkerList({ workers, isProfileCreatePage, onEdit, onDelete, onRun, onToggleActive }) {
  return (
    <Grid container spacing={2} mt={2}>
      {workers.map((profile) => (
        <Grid key={profile.id}>
          <WorkerCard profile={profile} isProfileCreatePage={isProfileCreatePage} onEdit={onEdit} onDelete={onDelete} onRun={onRun} onToggleActive={onToggleActive} />
        </Grid>
      ))}
    </Grid>
  );
}

export default WorkerList;
