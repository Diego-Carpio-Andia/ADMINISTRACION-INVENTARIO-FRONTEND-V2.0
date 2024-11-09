import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUserProducts, setSelectedUserProducts] = useState([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    Username: '',
    Nombre: '',
    Apellidos: '',
    Email: '',
    Password: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar para registro exitoso
  const [loginSnackbarOpen, setLoginSnackbarOpen] = useState(false); // Snackbar para error de inicio de sesión

  useEffect(() => {
    const token = localStorage.getItem('TokenAdministracion');
    if (token) {
      setIsLoggedIn(true);
      setLoading(true);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const bearer = 'Bearer ' + token;
      const response = await axios.get('https://backend-administracion-tesis-c9dxadg0cjfmcxg0.canadacentral-01.azurewebsites.net/DevolverTodosLosUsuarios', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': bearer
        }
      });

      const uniqueUsers = Object.values(response.data.reduce((acc, user) => {
        acc[user.Email] = acc[user.Email] || {
          Email: user.Email,
          'Nombre del minimarket': user['Nombre del minimarket'],
          NombreCompleto: user.NombreCompleto,
          Productos: []
        };
        acc[user.Email].Productos.push({
          'Nombre del producto': user['Nombre del producto'],
          CantidadInventario: user.CantidadInventario
        });
        return acc;
      }, {}));
      setUsuarios(uniqueUsers);
    } catch (error) {
      console.error('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email === 'admin@admin.com' && password === 'Puntero*5') {
        const response = await axios.post(
          'https://backend-inventario-tesis-afc6h7hme8d6bma8.canadacentral-01.azurewebsites.net/api/Usuario/login',
          { email, password }
        );
        setIsLoggedIn(true);
        setLoginError(false);
        const data = await response.data;
        localStorage.setItem('TokenAdministracion', data.token);
        fetchUserData(data.token);
      } else {
        // Manejar credenciales incorrectas
        setLoginError(true);
        setLoginSnackbarOpen(true); // Abrir Snackbar de error
      }
    } catch (error) {
      // Manejar otros errores de inicio de sesión
      setLoginError(true);
      setLoginSnackbarOpen(true); // Abrir Snackbar de error
      console.error('Error al iniciar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('TokenAdministracion');
    setIsLoggedIn(false);
    setUsuarios([]);
  };

  const handleViewProducts = (userEmail) => {
    const userProducts = usuarios.find(usuario => usuario.Email === userEmail).Productos;
    setSelectedUserProducts(userProducts);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserProducts([]);
  };

  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setNewUser({
      Username: '',
      Nombre: '',
      Apellidos: '',
      Email: '',
      Password: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRegister = () => {
    axios.post('https://backend-inventario-tesis-afc6h7hme8d6bma8.canadacentral-01.azurewebsites.net/api/usuario/registrar', newUser)
      .then(response => {
        console.log('Usuario registrado', response);
        setSnackbarOpen(true); // Mostrar Snackbar cuando el registro sea exitoso
        handleRegisterClose();
      })
      .catch(error => {
        console.error('Error al registrar usuario', error);
      });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setLoginSnackbarOpen(false); // Cerrar ambos Snackbar
  };

  return (
    <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', padding: '20px' }}>
      {!isLoggedIn ? (
        <Container maxWidth="xs" style={{ textAlign: 'center', marginTop: '20vh' }}>
          <Typography variant="h4" component="h1" style={{ marginBottom: '20px', color: '#3f51b5' }}>
            Iniciar Sesión
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleLogin}
          >
            Iniciar Sesión
          </Button>
        </Container>
      ) : (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Administración de PYMES
              </Typography>
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Container maxWidth={false}>
            {loading ? (
              <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
                <CircularProgress size={80} />
              </Grid>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRegisterOpen}
                  style={{ marginTop: '20px', marginBottom: '20px', backgroundColor: '#3f51b5', color: '#ffffff' }}
                >
                  Registrar Usuario
                </Button>
                <Grid container spacing={3}>
                  {usuarios.map((usuario, index) => (
                    <Grid item key={index} xs={12} sm={12} md={6} xl={4}>
                      <Card style={{ backgroundColor: '#ffffff', boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                        <CardContent>
                          <Typography variant="h5" component="div" gutterBottom style={{ color: '#3f51b5' }}>
                            {usuario.NombreCompleto}
                          </Typography>
                          <Typography variant="body1" color="textSecondary">
                            Email: {usuario.Email}
                          </Typography>
                          <Typography variant="body1" color="textSecondary">
                            Nombre del minimarket: {usuario['Nombre del minimarket']}
                          </Typography>
                          <Button variant="contained" color="primary" onClick={() => handleViewProducts(usuario.Email)} style={{ marginTop: '10px' }}>
                            Ver Productos
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Dialog para ver productos */}
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Productos del Usuario</DialogTitle>
                  <DialogContent>
                    {selectedUserProducts.map((product, index) => (
                      <Accordion key={index} sx={{ marginBottom: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{product['Nombre del producto']}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>Cantidad en Inventario: {product.CantidadInventario}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Cerrar
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Dialog para registro */}
                <Dialog open={registerOpen} onClose={handleRegisterClose}>
                  <DialogTitle>Registrar Usuario</DialogTitle>
                  <DialogContent>
                    <TextField label="Username" name="Username" fullWidth onChange={handleInputChange} />
                    <TextField label="Nombre" name="Nombre" fullWidth onChange={handleInputChange} />
                    <TextField label="Apellidos" name="Apellidos" fullWidth onChange={handleInputChange} />
                    <TextField label="Email" name="Email" fullWidth onChange={handleInputChange} />
                    <TextField label="Contraseña" name="Password" type="password" fullWidth onChange={handleInputChange} />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleRegisterClose} color="primary">
                      Cancelar
                    </Button>
                    <Button onClick={handleRegister} color="primary">
                      Registrar
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </Container>
        </>
      )}

      {/* Snackbar de registro exitoso */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Usuario registrado exitosamente!
        </Alert>
      </Snackbar>

      {/* Snackbar de error de inicio de sesión */}
      <Snackbar open={loginSnackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          Error al iniciar sesión. Credenciales incorrectas.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
