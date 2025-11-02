import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from './api';

const Login = () => {
  const navigate = useNavigate();

  // Detectar modo desarrollo (Vite)
  const DEV_MODE = (import.meta as any).env?.DEV ?? false;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Autocompletado en desarrollo
    email: DEV_MODE ? 'test@test.com' : '',
    password: DEV_MODE ? 'test' : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (DEV_MODE) {
      // Simular inicio de sesión en desarrollo
      await new Promise((res) => setTimeout(res, 700)); // breve simulación
      localStorage.setItem('token', 'dev-token-example');
      // Mensaje amistoso en consola (UI ya muestra alert)
      console.info(
        'Inicio de sesión simulado (modo desarrollo). Usuario: test@test.com / test'
      );
      navigate('/dashboard');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/usuarios/login', {
        email: formData.email,
        password: formData.password,
      });

      const data = res.data;
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: any) {
      if (err?.response) {
        const server = err.response.data;
        setError(server?.error || 'Error en autenticación.');
      } else {
        setError('No se pudo conectar al servidor.');
      }
    } finally {
      setLoading(false);
    }

    /* Si prefieres ver la llamada anterior comentada para referencia:
    // const res = await fetch('http://localhost:3000/usuarios/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: formData.email,
    //     password: formData.password,
    //   }),
    // });
    */
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Real Estate App
          </Typography>

          {/* Aviso amigable en modo desarrollo con credenciales autocompletadas */}
          {DEV_MODE && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Modo desarrollo: se han autocompletado credenciales de prueba — usuario:{' '}
              <strong>test@test.com</strong> | contraseña: <strong>test</strong>.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, [e.target.name]: e.target.value })
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete={DEV_MODE ? 'on' : 'current-password'}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, [e.target.name]: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;