import { useEffect, useState } from 'react';
import {
  Button, Typography, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import WorkerForm from '../components/WorkerSettingPage/WorkerForm';
import WorkerList from '../components/WorkerSettingPage/WorkerList';
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from '../api/workerProfileApi';

function WorkerSettingsPage() {

  const [workers, setWorkers] = useState([]);
  const [editingWorker, setEditingWorker] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [open, setOpen] = useState(false);

  // 🔹 2. Додавання нового профілю
  const handleSave = async (profile) => {
    if (editingWorker) {
      const res = await updateProfile(editingWorker.id, profile);
      setWorkers((prev) =>
        prev.map((w) => (w.id === editingWorker.id ? res.data : w))
      );
    } else {
      const res = await createProfile(profile);
      setWorkers((prev) => [...prev, res.data]);
    }
    setEditingWorker(null);
    setOpen(false); // закриваємо ТІЛЬКИ при успіху
  };

  const handleToggleActive = async (profile) => {
    console.log("profile:", profile);

    try {
      const updated = await updateProfile(profile.id, { is_active: !profile.is_active });
      setWorkers((prev) =>
        prev.map((w) => (w.id === profile.id ? updated.data : w))
      );
    } catch (err) {
      console.error('Помилка оновлення is_active', err);
    }
  };


  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setOpen(true);
  };

  // 🟥 Видалення профілю за ID
  // const handleDelete = async (idToDelete) => {
  //   const confirmed = window.confirm('Точно видалити цей профіль?');
  //   if (!confirmed) return;

  //   try {
  //     await deleteProfile(idToDelete);
  //     setWorkers((prev) => prev.filter((w) => w.id !== idToDelete));
  //   } catch (err) {
  //     console.error('Error deleting profile', err);
  //   }
  // };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteProfile(deleteTarget);
      setWorkers((prev) => prev.filter((w) => w.id !== deleteTarget));
    } catch (err) {
      console.error('Error deleting profile', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    fetchProfiles()
      .then((res) => setWorkers(res.data))
      .catch((err) => console.error('Error fetching profiles', err));
  }, []);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Профілі запуску
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        + ДОДАТИ ПРОФІЛЬ
      </Button>

      <WorkerForm
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingWorker(null);
        }}
        onSave={handleSave}
        onError={(err) => console.error(err)}
        initialData={editingWorker}
      />
      <WorkerList workers={workers} isProfileCreatePage={true} onEdit={handleEdit} onDelete={(id) => setDeleteTarget(id)} onToggleActive={handleToggleActive} />
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 450,
              borderRadius: 2.5,
              p: 3,
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 'bold', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          🗑️ Підтвердження видалення
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете <strong>видалити цей профіль</strong>? Цю дію не можна буде скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1.5, px: 3, pb: 2 }}>          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
          Скасувати
        </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WorkerSettingsPage;