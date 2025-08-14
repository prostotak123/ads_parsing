import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import WorkerList from '../components/WorkerSettingPage/WorkerList'; // 👈 можна використати той самий
import { fetchProfiles, runWorkerWithProfile } from '../api/workerProfileApi'; // 👈 імпортуємо реальний API
import { fetchWorkerLogs } from '../api/workerRunApi'; // 👈 імпортуємо реальний API

function WorkerRunPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetchProfiles()
      .then((res) => {
        const activeOnly = res.data.filter((profile) => profile.is_active);
        setProfiles(activeOnly);
      })
      .catch((err) => console.error('Error fetching profiles', err));
  }, []);

  const handleRun = async (id) => {
    try {
      runWorkerWithProfile(id).then((res) => {
        console.log(`Worker ${id} запущено!`)
      });
    } catch (err) {
      console.error('Помилка запуску воркера', err);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Запуск профілів вручну
      </Typography>

      <WorkerList
        workers={profiles}
        isProfileCreatePage={false}
        onEdit={null}
        onDelete={null}
        onRun={handleRun}
      />
    </Box>
  );
}

export default WorkerRunPage;
