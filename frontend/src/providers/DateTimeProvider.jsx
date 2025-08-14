// src/providers/DateTimeProvider.jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/uk'; // або 'en-gb'

dayjs.locale('uk');

const theme = createTheme({
  components: {
    MuiTimePicker: {
      defaultProps: { ampm: false },
    },
    MuiDateTimePicker: {
      defaultProps: { ampm: false },
    },
  },
});

export default function DateTimeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
