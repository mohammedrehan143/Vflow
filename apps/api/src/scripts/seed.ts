import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { ProviderModel } from '../models/Provider';
import { ListingModel } from '../models/Listing';
import { ParkingSpaceModel } from '../models/ParkingSpace';
import { ChargingPortModel } from '../models/ChargingPort';
import { BookingModel } from '../models/Booking';
import { PaymentModel } from '../models/Payment';
import { FinancialLedgerModel } from '../models/FinancialLedger';
import { PayoutModel } from '../models/Payout';
import { ProviderService } from '../services/providerService';

export async function seedDatabaseIfEmpty() {
  const count = await UserModel.countDocuments();
  if (count > 0) {
    console.log('[Seed] Database already has records, skipping seed.');
    return;
  }
  await runSeed();
}

export async function runSeed() {
  console.log('[Seed] Seeding realistic demo data for VFlow...');

  const passwordHash = await bcrypt.hash('VFlow@123', 10);

  // 1. Create Core Users
  const adminUser = await UserModel.create({
    email: 'admin@vflow.in',
    passwordHash,
    fullName: 'VFlow Administrator',
    phone: '+91 98888 11111',
    role: 'admin'
  });

  const providerUser = await UserModel.create({
    email: 'provider@vflow.in',
    passwordHash,
    fullName: 'Rajesh Sharma (GreenPark Hubs)',
    phone: '+91 98888 22222',
    role: 'provider'
  });

  const customerUser = await UserModel.create({
    email: 'driver@vflow.in',
    passwordHash,
    fullName: 'Aditya Verma',
    phone: '+91 98888 33333',
    role: 'customer',
    vehicles: [
      {
        licensePlate: 'KA-01-MJ-4050',
        model: 'Tata Nexon EV Max',
        type: 'ev',
        isDefault: true
      },
      {
        licensePlate: 'KA-03-NB-8821',
        model: 'Hyundai Creta',
        type: 'suv',
        isDefault: false
      }
    ]
  });

  // 2. Canonical Provider Record in 'providers' collection
  const provider = await ProviderModel.create({
    authUserId: providerUser._id.toString(),
    providerType: 'ev_operator',
    displayName: 'GreenPark Mobility & EV Hubs',
    email: 'provider@vflow.in',
    phone: '+91 98888 22222',
    verificationStatus: 'verified',
    businessName: 'GreenPark Infrastructure Pvt Ltd',
    address: {
      street: '100 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
      landmark: 'Near Sony World Signal'
    },
    serviceAreas: ['Bengaluru', 'Mumbai', 'Hyderabad'],
    serviceTypes: ['parking', 'charging', 'combined'],
    payoutAccountStatus: 'active',
    payoutConfiguration: {
      accountHolderName: 'GreenPark Infrastructure Pvt Ltd',
      bankAccountNumber: '50200088991122',
      ifscCode: 'HDFC0001234',
      upiId: 'greenpark@hdfcbank',
      payoutMethod: 'manual_bank_transfer'
    }
  });

  const providerId = provider._id.toString();

  // 3. Create Sample Listings with Real Geo Coordinates
  const sampleListingsData = [
    {
      title: 'GreenPark Smart Hub — Koramangala Prime',
      description: 'Covered dedicated basement parking slots with high-speed 60kW DC Fast EV Charging (CCS2) and 22kW Type-2 AC chargers. 24/7 security guard, CCTV surveillance, automated boom barriers, and restroom facilities.',
      serviceType: 'combined' as const,
      parkingType: 'commercial_building' as const,
      address: {
        street: '100 Feet Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India',
        landmark: 'Near Sony World Junction'
      },
      location: {
        type: 'Point' as const,
        coordinates: [77.6271, 12.9352] as [number, number] // [lng, lat]
      },
      amenities: ['24/7 Access', 'CCTV Surveillance', 'Covered Parking', 'EV Fast Charging', 'Security Guard', 'Washroom', 'Elevator Access'],
      photos: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        hourlyRatePaise: 6000, // ₹60/hr
        dailyRatePaise: 45000, // ₹450/day
        overnightRatePaise: 35000, // ₹350/overnight
        chargingRatePerKwhPaise: 1800, // ₹18/kWh
        chargingFlatRatePaise: 25000 // ₹250 flat session
      },
      cancellationPolicy: 'flexible' as const,
      instantBooking: true,
      entryExitInstructions: 'Show your 4-digit VFlow Access PIN at the boom barrier scanner or security kiosk.',
      houseRules: ['Park strictly inside the designated marked yellow slot', 'Turn off ignition before plugging in EV charger', 'No engine idling allowed inside basement'],
      isCovered: true,
      spaces: 5,
      ports: [
        { portIdentifier: 'DC Gun #1 (CCS2 Fast)', chargerType: 'DC_Fast' as const, connectorType: 'CCS2' as const, powerKw: 60, pricingModel: 'per_kwh' as const, pricePerUnitPaise: 1800 },
        { portIdentifier: 'AC Gun #2 (Type 2)', chargerType: 'AC' as const, connectorType: 'Type 2' as const, powerKw: 22, pricingModel: 'per_kwh' as const, pricePerUnitPaise: 1400 }
      ]
    },
    {
      title: 'Indiranagar 12th Main Metro Parking & EV Station',
      description: 'Secure open ground parking steps away from Indiranagar 12th Main buzzing high street and metro station. Ideal for shoppers, diners, and daily commuters.',
      serviceType: 'parking' as const,
      parkingType: 'shopping_area' as const,
      address: {
        street: '12th Main Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        landmark: 'Opposite Toit Brewpub'
      },
      location: {
        type: 'Point' as const,
        coordinates: [77.6412, 12.9719] as [number, number]
      },
      amenities: ['CCTV Surveillance', '24/7 Access', 'Well Lit', 'Wheelchair Accessible'],
      photos: [
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        hourlyRatePaise: 5000, // ₹50/hr
        dailyRatePaise: 40000
      },
      cancellationPolicy: 'flexible' as const,
      instantBooking: true,
      entryExitInstructions: 'Drive in and display your digital booking pass on your dashboard or phone.',
      isCovered: false,
      spaces: 8,
      ports: []
    },
    {
      title: 'BKC Financial Center EV Rapid Hub',
      description: 'State of the art high-speed EV charging hub in Bandra Kurla Complex. 120kW Dual-gun DC Fast chargers suitable for luxury EVs and fleet vehicles.',
      serviceType: 'charging' as const,
      parkingType: 'office' as const,
      address: {
        street: 'G Block, Bandra Kurla Complex, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        country: 'India',
        landmark: 'Near Jio World Drive'
      },
      location: {
        type: 'Point' as const,
        coordinates: [72.8687, 19.0688] as [number, number]
      },
      amenities: ['120kW Ultra Fast Charging', 'Customer Lounge', 'Free Wi-Fi', 'Coffee Machine', '24/7 Security'],
      photos: [
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        hourlyRatePaise: 0,
        chargingRatePerKwhPaise: 2100, // ₹21/kWh
        chargingFlatRatePaise: 30000
      },
      cancellationPolicy: 'moderate' as const,
      instantBooking: true,
      isCovered: true,
      spaces: 4,
      ports: [
        { portIdentifier: 'BKC Gun #1 (CCS2 120kW)', chargerType: 'DC_Fast' as const, connectorType: 'CCS2' as const, powerKw: 120, pricingModel: 'per_kwh' as const, pricePerUnitPaise: 2100 },
        { portIdentifier: 'BKC Gun #2 (CCS2 120kW)', chargerType: 'DC_Fast' as const, connectorType: 'CCS2' as const, powerKw: 120, pricingModel: 'per_kwh' as const, pricePerUnitPaise: 2100 }
      ]
    },
    {
      title: 'Cyber City Corporate Parking & Charging Bay',
      description: 'Multi-level covered corporate park with dedicated EV bays and standard sedan/SUV spaces. Seamless automated RFID and QR check-in.',
      serviceType: 'combined' as const,
      parkingType: 'office' as const,
      address: {
        street: 'DLF Cyber City, Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
        landmark: 'Near Cyber Hub Gateway'
      },
      location: {
        type: 'Point' as const,
        coordinates: [77.0878, 28.4950] as [number, number]
      },
      amenities: ['Covered Multi-Level', 'EV Fast Charging', 'Car Wash (Upcoming)', 'Valet Drop-off Zone (Coming Soon)', '24/7 Guarded'],
      photos: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        hourlyRatePaise: 8000,
        dailyRatePaise: 60000,
        chargingRatePerKwhPaise: 1900
      },
      cancellationPolicy: 'flexible' as const,
      instantBooking: true,
      isCovered: true,
      spaces: 10,
      ports: [
        { portIdentifier: 'CyberCity Port 1 (CCS2)', chargerType: 'DC_Fast' as const, connectorType: 'CCS2' as const, powerKw: 50, pricingModel: 'per_kwh' as const, pricePerUnitPaise: 1900 }
      ]
    }
  ];

  let primaryListingId = '';
  let primarySpaceId = '';
  let primaryPortId = '';

  for (let idx = 0; idx < sampleListingsData.length; idx++) {
    const item = sampleListingsData[idx];
    const listing = await ListingModel.create({
      providerId,
      title: item.title,
      description: item.description,
      serviceType: item.serviceType,
      parkingType: item.parkingType,
      address: item.address,
      location: item.location,
      amenities: item.amenities,
      photos: item.photos,
      pricing: item.pricing,
      cancellationPolicy: item.cancellationPolicy,
      instantBooking: item.instantBooking,
      entryExitInstructions: item.entryExitInstructions,
      houseRules: item.houseRules,
      isCovered: item.isCovered,
      status: 'active',
      averageRating: 4.8,
      reviewCount: 24 + idx * 8
    });

    const listingId = listing._id.toString();
    if (idx === 0) primaryListingId = listingId;

    const spaces = [];
    for (let s = 1; s <= item.spaces; s++) {
      const space = await ParkingSpaceModel.create({
        listingId,
        providerId,
        spaceIdentifier: `Bay ${String.fromCharCode(65 + Math.floor((s - 1) / 4))}-${((s - 1) % 4) + 1}`,
        vehicleRestrictions: ['hatchback', 'sedan', 'suv', 'ev'],
        isCovered: item.isCovered,
        status: 'available'
      });
      spaces.push(space);
      if (idx === 0 && s === 1) primarySpaceId = space._id.toString();
    }

    if (item.ports.length > 0) {
      for (let p = 0; p < item.ports.length; p++) {
        const portInfo = item.ports[p];
        const linkedSpace = spaces[p];
        const port = await ChargingPortModel.create({
          listingId,
          providerId,
          portIdentifier: portInfo.portIdentifier,
          chargerType: portInfo.chargerType,
          connectorType: portInfo.connectorType,
          powerKw: portInfo.powerKw,
          pricingModel: portInfo.pricingModel,
          pricePerUnitPaise: portInfo.pricePerUnitPaise,
          attachedParkingSpaceId: linkedSpace ? linkedSpace._id.toString() : undefined,
          status: 'available'
        });

        if (linkedSpace) {
          linkedSpace.isAttachedToCharger = true;
          linkedSpace.attachedChargingPortId = port._id.toString();
          await linkedSpace.save();
        }

        if (idx === 0 && p === 0) primaryPortId = port._id.toString();
      }
    }
  }

  // 4. Create Sample Completed and Confirmed Bookings with Ledger Entries
  const now = new Date();
  const pastStart = new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString();
  const pastEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Completed booking from yesterday
  const completedBooking = await BookingModel.create({
    bookingNumber: 'VF-2026-COMPL1',
    customerId: customerUser._id.toString(),
    providerId,
    listingId: primaryListingId,
    serviceType: 'combined',
    parkingSpaceId: primarySpaceId,
    chargingPortId: primaryPortId,
    startTime: pastStart,
    endTime: pastEnd,
    status: 'completed',
    pricing: {
      baseAmountPaise: 24000, // ₹240 (4 hours @ ₹60)
      chargingAmountPaise: 36000, // ₹360 (20 kWh @ ₹18)
      platformCommissionPaise: 6000, // ₹60 (10%)
      gstPaise: 1080, // ₹10.80 (18% on ₹60)
      totalAmountPaise: 61080, // ₹610.80
      providerSharePaise: 54000 // ₹540.00 net to provider
    },
    paymentStatus: 'captured',
    accessPin: '4912',
    vehicleDetails: {
      licensePlate: 'KA-01-MJ-4050',
      model: 'Tata Nexon EV Max',
      type: 'ev'
    }
  });

  const payment1 = await PaymentModel.create({
    bookingId: completedBooking._id.toString(),
    customerId: customerUser._id.toString(),
    providerId,
    amountPaise: 61080,
    currency: 'INR',
    razorpayOrderId: 'order_seed_demo_completed_01',
    razorpayPaymentId: 'pay_seed_demo_completed_01',
    razorpaySignature: 'sig_seed_demo_verified',
    status: 'captured'
  });

  completedBooking.paymentId = payment1._id.toString();
  await completedBooking.save();

  // Next-day target date is today!
  const todayStr = new Date().toISOString().split('T')[0];
  await FinancialLedgerModel.create({
    providerId,
    bookingId: completedBooking._id.toString(),
    paymentId: payment1._id.toString(),
    entryType: 'booking_earning',
    grossAmountPaise: 60000,
    platformCommissionPaise: 6000,
    netPayablePaise: 54000,
    eligibilityTimestamp: new Date().toISOString(),
    targetPayoutDate: todayStr,
    status: 'eligible', // Ready for next-day payout!
    notes: 'Booking VF-2026-COMPL1 earnings (4h Parking + EV Charging)'
  });

  // Active confirmed booking for upcoming weekend
  const upcomingStart = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  const upcomingEnd = new Date(now.getTime() + 52 * 60 * 60 * 1000).toISOString();

  const confirmedBooking = await BookingModel.create({
    bookingNumber: 'VF-2026-UPCOM1',
    customerId: customerUser._id.toString(),
    providerId,
    listingId: primaryListingId,
    serviceType: 'parking',
    parkingSpaceId: primarySpaceId,
    startTime: upcomingStart,
    endTime: upcomingEnd,
    status: 'confirmed',
    pricing: {
      baseAmountPaise: 24000,
      chargingAmountPaise: 0,
      platformCommissionPaise: 2400,
      gstPaise: 432,
      totalAmountPaise: 24432,
      providerSharePaise: 21600
    },
    paymentStatus: 'captured',
    accessPin: '8204',
    vehicleDetails: {
      licensePlate: 'KA-01-MJ-4050',
      model: 'Tata Nexon EV Max',
      type: 'ev'
    }
  });

  const payment2 = await PaymentModel.create({
    bookingId: confirmedBooking._id.toString(),
    customerId: customerUser._id.toString(),
    providerId,
    amountPaise: 24432,
    currency: 'INR',
    razorpayOrderId: 'order_seed_demo_upcoming_02',
    razorpayPaymentId: 'pay_seed_demo_upcoming_02',
    razorpaySignature: 'sig_seed_demo_verified_02',
    status: 'captured'
  });

  confirmedBooking.paymentId = payment2._id.toString();
  await confirmedBooking.save();

  // Pending ledger entry for upcoming booking (target payout date = day after booking)
  const upcomingPayoutTarget = new Date(new Date(upcomingEnd).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await FinancialLedgerModel.create({
    providerId,
    bookingId: confirmedBooking._id.toString(),
    paymentId: payment2._id.toString(),
    entryType: 'booking_earning',
    grossAmountPaise: 24000,
    platformCommissionPaise: 2400,
    netPayablePaise: 21600,
    eligibilityTimestamp: new Date(new Date(upcomingEnd).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    targetPayoutDate: upcomingPayoutTarget,
    status: 'pending',
    notes: 'Booking VF-2026-UPCOM1 earnings (Pending arrival completion)'
  });

  // 5. Recalculate Canonical Provider Totals
  await ProviderService.recalculateTotals(providerId);

  console.log('[Seed] Seeding completed successfully!');
  console.log('-------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('👑 Admin:     admin@vflow.in    / VFlow@123');
  console.log('⚡ Provider:  provider@vflow.in / VFlow@123');
  console.log('🚗 Customer:  driver@vflow.in   / VFlow@123');
  console.log('-------------------------------------------------------');
}

// Allow direct CLI execution
if (process.argv[1]?.includes('seed.ts')) {
  (async () => {
    const { connectDatabase, disconnectDatabase } = await import('../config/database');
    await connectDatabase();
    await runSeed();
    await disconnectDatabase();
    process.exit(0);
  })();
}
