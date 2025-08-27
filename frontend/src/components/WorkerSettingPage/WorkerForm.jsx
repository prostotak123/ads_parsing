import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Paper,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  TimePicker,
  DateTimePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  Schedule,
  Link as LinkIcon,
  AccessTime,
  Event,
  Repeat,
  Today
} from '@mui/icons-material';

const scheduleOptions = [
  { value: 'manual', label: 'Manual', icon: <Schedule fontSize="small" /> },
  { value: 'scheduled_once', label: 'One-time', icon: <Event fontSize="small" /> },
  { value: 'interval', label: 'Interval', icon: <Repeat fontSize="small" /> },
  { value: 'daily', label: 'Daily', icon: <Today fontSize="small" /> }
];

const baseURL = import.meta.env.VITE_CORE_PARSER_URL;

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
  const theme = useTheme();
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
      if (!value.startsWith(baseURL)) {
        setErrors((prev) => ({
          ...prev,
          filter_url: `URL повинен починатися з ${baseURL}`
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
    if (!form.filter_url.startsWith(baseURL)) {
      newErrors.filter_url = `Посилання повинне починатися з ${baseURL}`;
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

  const selectedOption = scheduleOptions.find(opt => opt.value === form.schedule_type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      paper={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Modern Header */}
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {initialData ? 'Редагування профілю' : 'Новий профіль'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {initialData ? 'Змініть параметри існуючого профілю' : 'Створіть новий профіль для парсингу'}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Basic Info Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon color="primary" />
                Основна інформація
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Назва профілю"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="URL фільтру"
                  name="filter_url"
                  value={form.filter_url}
                  onChange={handleChange}
                  error={!!errors.filter_url}
                  helperText={
                    errors.filter_url || `Наприклад: ${baseURL}search...`
                  }
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Paper>

            {/* Schedule Type Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.info.main, 0.02),
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.1),
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedOption?.icon}
                Тип розкладу
              </Typography>

              <TextField
                select
                label="Тип розкладу"
                name="schedule_type"
                value={form.schedule_type}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                {scheduleOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {option.icon}
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Schedule Configuration */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {form.schedule_type === 'scheduled_once' && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <DateTimePicker
                      label="Дата та час запуску"
                      value={form.schedule_time ? dayjs(form.schedule_time) : null}
                      onChange={handleDateChange('schedule_time')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.schedule_time,
                          helperText: errors.schedule_time,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}

                {form.schedule_type === 'interval' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                            error: !!errors.schedule_start,
                            helperText: errors.schedule_start,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }
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
                            error: !!errors.schedule_end,
                            helperText: errors.schedule_end,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }
                          }
                        }}
                      />
                    </Box>

                    <TextField
                      label="Інтервал (хвилини)"
                      name="frequency_minutes"
                      type="number"
                      value={form.frequency_minutes}
                      onChange={handleChange}
                      error={!!errors.frequency_minutes}
                      helperText={errors.frequency_minutes}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                )}

                {form.schedule_type === 'daily' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                            error: !!errors.schedule_start,
                            helperText: errors.schedule_start,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }
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
                            error: !!errors.schedule_end,
                            helperText: errors.schedule_end,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }
                          }
                        }}
                      />
                    </Box>

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
                          error: !!errors.daily_run_time,
                          helperText: errors.daily_run_time,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </LocalizationProvider>
            </Paper>

            {/* Settings Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.success.main, 0.02),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.1),
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="success" />
                Налаштування
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_active}
                    onChange={handleChange}
                    name="is_active"
                    sx={{
                      '&.Mui-checked': {
                        color: 'success.main',
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Активний профіль
                  </Typography>
                }
              />
            </Paper>
          </Box>
        </DialogContent>

        <Divider />

        {/* Modern Actions */}
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Скасувати
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Зберегти
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default WorkerForm;