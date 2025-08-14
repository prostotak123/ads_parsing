import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  TimePicker,
  DateTimePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const scheduleOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled_once', label: 'One-time' },
  { value: 'interval', label: 'Interval' },
  { value: 'daily', label: 'Daily' }
];

const sanitizeFormData = (form) => {
  const cleaned = { ...form };

  switch (form.schedule_type) {
    case 'scheduled_once':
      cleaned.schedule_start = null;
      cleaned.schedule_end = null;
      cleaned.frequency_minutes = null;
      cleaned.daily_run_time = null;
      break;

    case 'interval':
      cleaned.schedule_time = null;
      cleaned.daily_run_time = null;
      break;

    case 'daily':
      cleaned.schedule_time = null;
      // cleaned.schedule_start = null;
      // cleaned.schedule_end = null;
      cleaned.frequency_minutes = null;
      break;

    case 'manual':
    default:
      cleaned.schedule_time = null;
      cleaned.schedule_start = null;
      cleaned.schedule_end = null;
      cleaned.frequency_minutes = null;
      cleaned.daily_run_time = null;
      break;
  }

  return cleaned;
};

function WorkerForm({ open, onClose, onSave, onError, initialData }) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    filter_url: '',
    schedule_type: 'manual',
    schedule_time: null,
    schedule_start: null,
    schedule_end: null,
    frequency_minutes: null,
    daily_run_time: null,
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: '',
        filter_url: '',
        schedule_type: 'manual',
        schedule_time: null,
        schedule_start: null,
        schedule_end: null,
        frequency_minutes: null,
        daily_run_time: null,
        is_active: true
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'filter_url') {
      if (!value.startsWith('https://adheart.me/')) {
        setErrors((prev) => ({
          ...prev,
          filter_url: 'URL повинен починатися з https://adheart.me/'
        }));
      } else {
        setErrors((prev) => ({ ...prev, filter_url: '' }));
      }
    }

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleDateChange = (field) => (newValue) => {
    setForm((prev) => ({
      ...prev,
      [field]: newValue?.toISOString() || ''
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.filter_url.startsWith('https://adheart.me/')) {
      newErrors.filter_url = 'Посилання повинне починатися з https://adheart.me/';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const cleaned = sanitizeFormData(form);
      await onSave(cleaned);
      onClose();
    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        const normalized = Object.entries(backendErrors).reduce(
          (acc, [field, msgs]) => {
            acc[field] = Array.isArray(msgs) ? msgs[0] : msgs;
            return acc;
          },
          {}
        );
        setErrors(normalized);
      }
      if (onError) onError(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Редагування профілю' : 'Новий профіль'}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
        >
          <TextField
            label="Назва профілю"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="URL фільтру"
            name="filter_url"
            value={form.filter_url}
            onChange={handleChange}
            error={!!errors.filter_url}
            helperText={
              errors.filter_url || 'Наприклад: https://adheart.me/search?...'
            }
            fullWidth
          />

          <TextField
            select
            label="Тип розкладу"
            name="schedule_type"
            value={form.schedule_type}
            onChange={handleChange}
            fullWidth
          >
            {scheduleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {form.schedule_type === 'scheduled_once' && (
              <DateTimePicker
                label="Дата та час запуску"
                value={form.schedule_time ? dayjs(form.schedule_time) : null}
                onChange={handleDateChange('schedule_time')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'dense',
                    error: !!errors.schedule_time,
                    helperText: errors.schedule_time
                  }
                }}
              />
            )}

            {form.schedule_type === 'interval' && (
              <>
                <DateTimePicker
                  label="Початок"
                  value={form.schedule_start ? dayjs(form.schedule_start) : null}
                  onChange={(newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      schedule_start: newValue?.toISOString() || ''
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.schedule_start;
                      return newErrors;
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: !!errors.schedule_start,
                      helperText: errors.schedule_start
                    }
                  }}
                />

                <DateTimePicker
                  label="Кінець"
                  value={form.schedule_end ? dayjs(form.schedule_end) : null}
                  onChange={(newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      schedule_end: newValue?.toISOString() || ''
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.schedule_end;
                      return newErrors;
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: !!errors.schedule_end,
                      helperText: errors.schedule_end
                    }
                  }}
                />

                <TextField
                  label="Інтервал (хвилини)"
                  name="frequency_minutes"
                  type="number"
                  value={form.frequency_minutes}
                  onChange={handleChange}
                  error={!!errors.frequency_minutes}
                  helperText={errors.frequency_minutes}
                  fullWidth
                />
              </>
            )}

            {form.schedule_type === 'daily' && (
              <>
                <DateTimePicker
                  label="Початок"
                  value={form.schedule_start ? dayjs(form.schedule_start) : null}
                  onChange={(newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      schedule_start: newValue?.toISOString() || ''
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.schedule_start;
                      return newErrors;
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: !!errors.schedule_start,
                      helperText: errors.schedule_start
                    }
                  }}
                />

                <DateTimePicker
                  label="Кінець"
                  value={form.schedule_end ? dayjs(form.schedule_end) : null}
                  onChange={(newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      schedule_end: newValue?.toISOString() || ''
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.schedule_end;
                      return newErrors;
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: !!errors.schedule_end,
                      helperText: errors.schedule_end
                    }
                  }}
                />

                <TimePicker
                  label="Щоденний запуск"
                  value={
                    form.daily_run_time
                      ? dayjs(`1970-01-01T${form.daily_run_time}`)
                      : null
                  }
                  onChange={(newValue) => {
                    setForm((prev) => ({
                      ...prev,
                      daily_run_time:
                        newValue?.toDate().toTimeString().slice(0, 8) || ''
                    }));
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.daily_run_time;
                      return newErrors;
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      error: !!errors.daily_run_time,
                      helperText: errors.daily_run_time
                    }
                  }}
                />
              </>
            )}
          </LocalizationProvider>

          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_active}
                onChange={handleChange}
                name="is_active"
              />
            }
            label="Активний"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Скасувати</Button>
          <Button variant="contained" type="submit">
            Зберегти
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default WorkerForm;
