import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import type { Property } from '../types/types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={property.imageUrl}
        alt={property.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {property.title}
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {formatPrice(property.price)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <LocationOn color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {property.location}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {property.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;