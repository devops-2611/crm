import React from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container
      size="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >

      <Title order={1} style={{ fontWeight: 700, marginBottom: 20 }}>
        Oops! Page Not Found
      </Title>
      <Text size="lg" color="dimmed" style={{ marginBottom: 30 }}>
        The page you're looking for might have been removed or is temporarily unavailable.
      </Text>
      <Group>
        <Button onClick={handleGoHome} variant="outline" color="blue" size="md">
          Go back to Home
        </Button>
      </Group>
    </Container>
  );
};

export default NotFoundPage;
