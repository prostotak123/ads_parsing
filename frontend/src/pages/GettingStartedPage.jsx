import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  alpha,
  useTheme
} from '@mui/material';
import {
  Settings,
  PlayArrow,
  DataUsage,
  Schedule,
  Event,
  Repeat,
  Today,
  CheckCircle,
  Warning,
  Info,
  Help,
  Security,
  Code,
  Link as LinkIcon,
  ExpandMore,
  Lightbulb,
  Speed,
  Visibility
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function GettingStartedPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState(false);

  const scheduleTypes = [
    {
      type: 'manual',
      label: 'Мануальний',
      icon: <Schedule color="primary" />,
      description: 'Запускаєте вручну в розділі "Run Worker"',
      color: 'primary',
      example: 'Використовуйте для тестування або разових запусків'
    },
    {
      type: 'scheduled_once',
      label: 'Одноразовий',
      icon: <Event color="secondary" />,
      description: 'Запуск один раз у заданий час',
      color: 'secondary',
      example: 'Наприклад: завтра о 14:00'
    },
    {
      type: 'interval',
      label: 'Інтервальний',
      icon: <Repeat color="success" />,
      description: 'Запуск кожні N хвилин між початком та кінцем',
      color: 'success',
      example: 'Кожні 30 хвилин з 9:00 до 18:00'
    },
    {
      type: 'daily',
      label: 'Щоденний',
      icon: <Today color="info" />,
      description: 'Запуск щодня о певний час у заданому періоді',
      color: 'info',
      example: 'Щодня о 12:00 протягом тижня'
    }
  ];

  const quickActions = [
    {
      title: 'Створити профіль',
      description: 'Налаштуйте новий профіль парсингу',
      icon: <Settings />,
      color: 'primary',
      action: () => navigate('/workers/settings')
    },
    {
      title: 'Запустити воркер',
      description: 'Миттєво запустити збір даних',
      icon: <PlayArrow />,
      color: 'success',
      action: () => navigate('/workers/run')
    },
    // {
    //   title: 'Переглянути дані',
    //   description: 'Аналіз зібраних результатів',
    //   icon: <DataUsage />,
    //   color: 'info',
    //   action: () => navigate('/data')
    // }
  ];

  const faqs = [
    {
      question: 'Чому профіль не запускається автоматично?',
      answer: 'Перевірте: 1) Профіль активний (тумблер увімкнено), 2) Час запуску настав, 3) URL правильний'
    },
    {
      question: 'Що робити з помилкою "401 Unauthorized"?',
      answer: 'Ваша сесія закінчилась. Увійдіть знову - система автоматично поверне вас на потрібну сторінку'
    },
    {
      question: 'Як змінити час запуску?',
      answer: 'Відредагуйте профіль через три крапки в карточці або у Worker Settings'
    },
    {
      question: 'Чи можна запускати декілька профілів одночасно?',
      answer: 'Так, система автоматично керує чергою. Кожен профіль виконується незалежно'
    },
    {
      question: 'URL не працює - що робити?',
      answer: 'URL має починатися з "https://adheart.me/". Скопіюйте посилання з фільтрами прямо з AdHeart'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <Help sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AdHeart Parser Guide
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Повний посібник з використання системи автоматичного збору рекламних креативів
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Швидкий старт
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      bgcolor: `${action.color}.main`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(action.icon, { sx: { color: 'white', fontSize: 28 } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Step by Step */}
          <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb color="warning" />
              Покрокова інструкція
            </Typography>

            <Stack spacing={4}>
              {/* Step 1 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="1" color="primary" size="small" />
                  Створення профілю
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Профіль - це набір налаштувань для парсингу конкретного фільтру AdHeart
                </Alert>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText
                      primary="Назва профілю"
                      secondary="Виберіть зрозумілу назву, наприклад: 'Креативи конкурентів'"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LinkIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="URL фільтру"
                      secondary="Скопіюйте повне посилання з AdHeart після налаштування фільтрів"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Schedule color="info" /></ListItemIcon>
                    <ListItemText
                      primary="Тип планування"
                      secondary="Оберіть як часто запускати парсинг (детальніше нижче)"
                    />
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  onClick={() => navigate('/workers/settings')}
                  sx={{ mt: 2 }}
                >
                  Створити профіль
                </Button>
              </Box>

              {/* Step 2 */}
              <Divider />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="2" color="success" size="small" />
                  Запуск парсингу
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Для мануальних профілів перейдіть до "Run Worker" та натисніть кнопку запуску.
                  Автоматичні профілі запускаються за розкладом.
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Ви можете бачити статус виконання в реальному часі
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/workers/run')}
                  sx={{ mt: 2 }}
                >
                  Запустити зараз
                </Button>
              </Box>

              {/* Step 3 */}
              <Divider />
              {/* <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="3" color="info" size="small" />
                  Перегляд результатів
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Зібрані дані автоматично зберігаються та доступні в розділі "Data".
                  Використовуйте фільтри для швидкого пошуку потрібної інформації.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DataUsage />}
                  onClick={() => navigate('/data')}
                  sx={{ mt: 2 }}
                >
                  Переглянути дані
                </Button>
              </Box> */}
            </Stack>
          </Paper>

          {/* Schedule Types */}
          <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed color="primary" />
              Типи планування
            </Typography>
            <Grid container spacing={3}>
              {scheduleTypes.map((type) => (
                <Grid item xs={12} sm={6} key={type.type}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderColor: `${type.color}.main`,
                      borderWidth: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette[type.color].main, 0.04),
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {type.icon}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {type.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {type.description}
                      </Typography>
                      <Chip
                        label={type.example}
                        size="small"
                        variant="outlined"
                        color={type.color}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Security Notice */}
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04), border: '1px solid', borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="warning" />
                  Безпека та доступ
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Всі розділи доступні тільки авторизованим користувачам
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  При закінченні сесії ви автоматично повернетесь на сторінку входу.
                  Після повторної авторизації система поверне вас туди, куди прямували.
                </Typography>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility color="info" />
                  Корисні поради
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="URL правильність"
                      secondary="Обов'язково починається з https://adheart.me/"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="Часові зони"
                      secondary="Система автоматично конвертує час в UTC"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary="Множинні запуски"
                      secondary="Можна запускати декілька профілів паралельно"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Help color="primary" />
                  Часті питання
                </Typography>
                {faqs.map((faq, index) => (
                  <Accordion key={index} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}