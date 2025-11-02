import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Paper,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Drawer,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Fab,
  Tooltip,
  Skeleton,
  Collapse,
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Map as MapIcon,
  Tune as TuneIcon,
  MyLocation as MyLocationIcon,
  Hotel as HotelIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
  Clear as ClearIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

interface Filters {
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minBedrooms: string;
  minBathrooms: string;
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('map');
  const [mapLoading, setMapLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    minBedrooms: '',
    minBathrooms: ''
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Propiedades de ejemplo
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 1,
      title: 'Apartamento Moderno Centro',
      price: 350000,
      location: 'Centro, Asunción',
      lat: -25.2637,
      lng: -57.5759,
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      type: 'apartment',
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Casa Familiar con Jardín',
      price: 450000,
      location: 'Lambaré, Paraguay',
      lat: -25.3426,
      lng: -57.6089,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      type: 'house',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
      isFavorite: true,
    },
    {
      id: 3,
      title: 'Departamento Vista al Río',
      price: 280000,
      location: 'San Lorenzo, Paraguay',
      lat: -25.3400,
      lng: -57.5089,
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      type: 'apartment',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      isFavorite: false,
    },
    {
      id: 4,
      title: 'Ático con Terraza',
      price: 520000,
      location: 'Villa Morra, Asunción',
      lat: -25.2850,
      lng: -57.5900,
      bedrooms: 3,
      bathrooms: 3,
      area: 180,
      type: 'apartment',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      isFavorite: false,
    },
  ]);

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);

  // Calcular filtros activos
  useEffect(() => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minArea) count++;
    if (filters.maxArea) count++;
    if (filters.minBedrooms) count++;
    if (filters.minBathrooms) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Leer la clave desde las variables de entorno de Vite
  const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Inicializar Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        console.warn('VITE_GOOGLE_MAPS_API_KEY no está definida. Google Maps no se cargará.');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initMap = () => {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const g = (window as any).google;

    const newMap = new g.maps.Map(mapElement, {
      center: { lat: -25.2637, lng: -57.5759 },
      zoom: 12,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: g.maps.ControlPosition.TOP_RIGHT,
        style: g.maps.MapTypeControlStyle.DROPDOWN_MENU,
      },
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: g.maps.ControlPosition.RIGHT_TOP,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: g.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMap(newMap);
    setMapLoading(false);
  };

  // Actualizar marcadores en el mapa
  useEffect(() => {
    if (!map) return;

    markers.forEach(marker => marker.setMap(null));

    const g = (window as any).google;

    const newMarkers = filteredProperties.map(property => {
      const marker = new g.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: map,
        title: property.title,
        animation: g.maps.Animation.DROP,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: property.isFavorite ? '#f50057' : '#667eea',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
      });

      const infoWindow = new g.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px; font-family: 'Roboto', sans-serif;">
            ${property.imageUrl ? `<img src="${property.imageUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #333;">${property.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 20px; color: #667eea; font-weight: bold;">$${property.price.toLocaleString()}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">📍 ${property.location}</p>
            <div style="display: flex; gap: 12px; font-size: 12px; color: #555;">
              <span>🛏️ ${property.bedrooms} hab</span>
              <span>🚿 ${property.bathrooms} baños</span>
              <span>📐 ${property.area}m²</span>
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        markers.forEach(m => {
          const info = (m as any).infoWindow;
          if (info) info.close();
        });
        infoWindow.open(map, marker);
      });

      (marker as any).infoWindow = infoWindow;

      return marker;
    });

    setMarkers(newMarkers);

    // Ajustar el mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      const bounds = new g.maps.LatLngBounds();
      filteredProperties.forEach(property => {
        bounds.extend({ lat: property.lat, lng: property.lng });
      });
      map.fitBounds(bounds);
      
      // Limitar el zoom máximo
      const listener = g.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        g.maps.event.removeListener(listener);
      });
    }
  }, [map, filteredProperties]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...properties];

    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.type === filters.propertyType);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    }

    if (filters.minArea) {
      filtered = filtered.filter(p => p.area >= parseInt(filters.minArea));
    }

    if (filters.maxArea) {
      filtered = filtered.filter(p => p.area <= parseInt(filters.maxArea));
    }

    if (filters.minBedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.minBedrooms));
    }

    if (filters.minBathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.minBathrooms));
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
    if (isMobile) setShowFilters(false);
  }, [filters, searchQuery, properties, isMobile]);

  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      minBedrooms: '',
      minBathrooms: ''
    });
    setSearchQuery('');
    setFilteredProperties(properties);
  };

  const toggleFavorite = (propertyId: number) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    setFilteredProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const centerMapOnLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
        map.setZoom(14);
      });
    }
  };

  // Panel de filtros
  const FilterPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon /> Filtros
            {activeFiltersCount > 0 && (
              <Chip label={activeFiltersCount} size="small" color="primary" />
            )}
          </Typography>
          {isMobile && (
            <IconButton onClick={() => setShowFilters(false)} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={resetFilters}
            sx={{ mb: 1 }}
          >
            Limpiar todo
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de propiedad</InputLabel>
            <Select
              value={filters.propertyType}
              label="Tipo de propiedad"
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="apartment">🏢 Apartamento</MenuItem>
              <MenuItem value="house">🏠 Casa</MenuItem>
              <MenuItem value="land">🌳 Terreno</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              💰 Rango de precio
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Desde"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Hasta"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              📐 Superficie (m²)
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Mín"
                type="number"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Máx"
                type="number"
                value={filters.maxArea}
                onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                fullWidth
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              🛏️ Habitaciones mínimas
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4, 5].map(num => (
                <Chip
                  key={num}
                  label={num}
                  onClick={() => setFilters({ ...filters, minBedrooms: num.toString() })}
                  color={filters.minBedrooms === num.toString() ? 'primary' : 'default'}
                  sx={{ flex: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              🚿 Baños mínimos
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4].map(num => (
                <Chip
                  key={num}
                  label={num}
                  onClick={() => setFilters({ ...filters, minBathrooms: num.toString() })}
                  color={filters.minBathrooms === num.toString() ? 'primary' : 'default'}
                  sx={{ flex: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="contained"
          onClick={applyFilters}
          fullWidth
          size="large"
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Aplicar Filtros
        </Button>
      </Box>
    </Box>
  );

  // Vista de lista de propiedades
  const PropertyList = () => (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      {filteredProperties.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron propiedades
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Intenta ajustar los filtros de búsqueda
          </Typography>
          <Button variant="outlined" onClick={resetFilters}>
            Limpiar Filtros
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredProperties.map(property => (
            <Card
              key={property.id}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => {
                // centrar el mapa en la propiedad al hacer click en la tarjeta
                if (map) {
                  map.setCenter({ lat: property.lat, lng: property.lng });
                  map.setZoom(14);
                }
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 200, sm: 'auto' },
                  objectFit: 'cover',
                }}
                image={property.imageUrl}
                alt={property.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {property.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                    >
                      {property.isFavorite ? (
                        <FavoriteFilledIcon color="error" />
                      ) : (
                        <FavoriteIcon />
                      )}
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    ${property.price.toLocaleString()}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    📍 {property.location}
                  </Typography>
                  
                  <Stack direction="row" spacing={2}>
                    <Chip icon={<HotelIcon />} label={`${property.bedrooms} hab`} size="small" />
                    <Chip icon={<BathtubIcon />} label={`${property.bathrooms} baños`} size="small" />
                    <Chip icon={<SquareFootIcon />} label={`${property.area}m²`} size="small" />
                  </Stack>
                </CardContent>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      {/* Barra de búsqueda superior */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          zIndex: 1100,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por título, ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 300 } }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            {!isMobile && (
              <>
                <Tooltip title="Vista de mapa">
                  <IconButton
                    color={viewMode === 'map' ? 'primary' : 'default'}
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista de lista">
                  <IconButton
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista dividida">
                  <IconButton
                    color={viewMode === 'split' ? 'primary' : 'default'}
                    onClick={() => setViewMode('split')}
                  >
                    <LayersIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>

          <Chip
            label={`${filteredProperties.length} ${filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {/* Contenedor principal */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Panel de filtros lateral */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            PaperProps={{
              sx: { width: 320 },
            }}
          >
            <FilterPanel />
          </Drawer>
        ) : (
          <Collapse in={showFilters} orientation="horizontal">
            <Paper
              elevation={3}
              sx={{
                width: 320,
                height: '100%',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <FilterPanel />
            </Paper>
          </Collapse>
        )}

        {/* Área de contenido (Mapa y/o Lista) */}
        <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
          {(viewMode === 'map' || viewMode === 'split') && (
            <Box
              sx={{
                flex: viewMode === 'split' ? 1 : undefined,
                width: viewMode === 'map' ? '100%' : undefined,
                position: 'relative',
              }}
            >
              {mapLoading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                  <Stack spacing={2} alignItems="center">
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                    <Typography variant="body2" color="text.secondary">Cargando mapa...</Typography>
                  </Stack>
                </Box>
              )}
              <div id="map" style={{ width: '100%', height: '100%' }} />
              
              {/* Botones flotantes del mapa */}
              <Tooltip title="Mi ubicación">
                <Fab
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', bottom: 24, right: 24 }}
                  onClick={centerMapOnLocation}
                >
                  <MyLocationIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}

          {(viewMode === 'list' || viewMode === 'split') && (
            <Box
              sx={{
                flex: viewMode === 'split' ? 1 : undefined,
                width: viewMode === 'list' ? '100%' : undefined,
                bgcolor: 'background.default',
                borderLeft: viewMode === 'split' ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <PropertyList />
            </Box>
          )}

          {/* Mensaje sin resultados */}
          {filteredProperties.length === 0 && viewMode === 'map' && !mapLoading && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                p: 4,
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                No se encontraron propiedades
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Intenta ajustar los filtros de búsqueda para ver más resultados
              </Typography>
              <Button variant="contained" onClick={resetFilters}>
                Limpiar Filtros
              </Button>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;