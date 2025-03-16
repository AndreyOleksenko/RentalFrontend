import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box 
} from '@mui/material';
import {
  CheckCircleOutline,
  Warning,
  Payment,
  AccessTime,
  DriveEta,
  Assignment
} from '@mui/icons-material';

const Terms = () => {
  const generalTerms = [
    {
      icon: <DriveEta />,
      title: 'Требования к водителю',
      items: [
        'Возраст не менее 21 года',
        'Водительский стаж от 2 лет',
        'Действующие водительские права',
        'Паспорт гражданина РФ'
      ]
    },
    {
      icon: <Payment />,
      title: 'Оплата и залог',
      items: [
        'Предоплата за весь период аренды',
        'Возвращаемый залог',
        'Оплата банковской картой или наличными',
        'Система скидок для постоянных клиентов'
      ]
    },
    {
      icon: <AccessTime />,
      title: 'Сроки и время',
      items: [
        'Минимальный срок аренды - 1 сутки',
        'Время выдачи и возврата с 9:00 до 20:00',
        'Продление аренды по согласованию',
        'Поздний возврат оплачивается дополнительно'
      ]
    }
  ];

  const penalties = [
    'Возврат автомобиля с повреждениями - оплата ремонта',
    'Возврат грязного автомобиля - штраф 1000₽',
    'Просрочка возврата - двойной тариф за каждые сутки',
    'Курение в салоне - штраф 5000₽'
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Условия аренды автомобилей
      </Typography>

      {generalTerms.map((section, index) => (
        <Paper sx={{ mt: 3, p: 3 }} key={index}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {section.icon}
            <Typography variant="h6" sx={{ ml: 2 }}>
              {section.title}
            </Typography>
          </Box>
          <List>
            {section.items.map((item, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <CheckCircleOutline color="success" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}

      <Paper sx={{ mt: 3, p: 3, bgcolor: '#fff3e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Warning color="warning" />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Штрафы и ответственность
          </Typography>
        </Box>
        <List>
          {penalties.map((penalty, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Assignment color="error" />
              </ListItemIcon>
              <ListItemText primary={penalty} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="body1" paragraph>
          Арендуя автомобиль, вы соглашаетесь со всеми вышеуказанными условиями. 
          Рекомендуем внимательно ознакомиться с договором аренды перед подписанием.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * Условия могут быть изменены компанией в одностороннем порядке
        </Typography>
      </Paper>
    </Container>
  );
};

export default Terms; 