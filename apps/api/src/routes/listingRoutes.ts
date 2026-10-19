import { Router } from 'express';
import { ListingService } from '../services/listingService';
import { ProviderService } from '../services/providerService';
import { authenticate } from '../middleware/auth';
import { CreateListingSchema } from '@vflow/shared';

const router = Router();

// Search listings with filters
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      city: req.query.city as string,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lng: req.query.lng ? Number(req.query.lng) : undefined,
      radiusKm: req.query.radiusKm ? Number(req.query.radiusKm) : undefined,
      serviceType: req.query.serviceType as any,
      parkingType: req.query.parkingType as any,
      minPricePaise: req.query.minPrice ? Number(req.query.minPrice) * 100 : undefined,
      maxPricePaise: req.query.maxPrice ? Number(req.query.maxPrice) * 100 : undefined,
      instantBookingOnly: req.query.instantBooking === 'true',
      isCovered: req.query.isCovered ? req.query.isCovered === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20
    };

    const result = await ListingService.searchListings(filters);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Get provider's own listings
router.get('/provider/mine', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const listings = await ListingService.getProviderListings(provider._id.toString());
    res.json({ success: true, listings });
  } catch (err) {
    next(err);
  }
});

// Get single listing details
router.get('/:id', async (req, res, next) => {
  try {
    const details = await ListingService.getListingDetails(req.params.id);
    if (!details) {
      res.status(404).json({ success: false, error: 'Listing not found' });
      return;
    }
    res.json({ success: true, ...details });
  } catch (err) {
    next(err);
  }
});

// Create new listing
router.post('/', authenticate, async (req, res, next) => {
  try {
    let provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      // Auto-create individual provider record if first listing
      provider = await ProviderService.registerOrGetProvider(req.user!.id, {
        providerType: 'individual',
        displayName: req.user!.fullName || 'Provider Host',
        email: req.user!.email,
        phone: '9876543210',
        address: req.body.address || {
          street: 'Main Road',
          city: req.body.address?.city || 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        },
        serviceAreas: [req.body.address?.city || 'Bengaluru'],
        serviceTypes: [req.body.serviceType]
      });
    }

    const validated = CreateListingSchema.parse(req.body);
    const listing = await ListingService.createListing(provider._id.toString(), validated);

    res.status(201).json({ success: true, listing });
  } catch (err) {
    next(err);
  }
});

export default router;
