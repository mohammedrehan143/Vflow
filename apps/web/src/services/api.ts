import {
  IListing,
  IBooking,
  IProvider,
  IPayment,
  IFinancialLedger,
  IPayout,
  IHangoutPlace,
  UserRole,
} from '@vflow/shared';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vflow_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  providerId?: string;
  avatarUrl?: string;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password?: string }) =>
      fetchJson<{ success: boolean; token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      fetchJson<{ success: boolean; token: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => fetchJson<{ success: boolean; user: AuthUser }>('/auth/me'),
  },

  // Listings
  listings: {
    search: (params?: {
      serviceType?: string;
      city?: string;
      lat?: number;
      lng?: number;
      radiusKm?: number;
      minPrice?: number;
      maxPrice?: number;
      connectorType?: string;
      isCovered?: boolean;
      instantBooking?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
        });
      }
      return fetchJson<{ success: boolean; listings: IListing[]; pagination: any }>(
        `/listings?${query.toString()}`
      );
    },
    getById: (id: string) =>
      fetchJson<{ success: boolean; listing: IListing; provider: Partial<IProvider> }>(
        `/listings/${id}`
      ),
    create: (data: any) =>
      fetchJson<{ success: boolean; listing: IListing }>('/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ success: boolean; listing: IListing }>(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Bookings
  bookings: {
    create: (data: {
      listingId: string;
      serviceType: 'parking' | 'charging' | 'combined';
      startTime: string;
      endTime: string;
      parkingSpaceId?: string;
      chargingPortId?: string;
      vehicleDetails?: any;
    }) =>
      fetchJson<{ success: boolean; booking: IBooking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (id: string) =>
      fetchJson<{
        success: boolean;
        booking: IBooking;
        listing: IListing;
        parkingSpace?: any;
        chargingPort?: any;
      }>(`/bookings/${id}`),
    getMyBookings: () =>
      fetchJson<{ success: boolean; bookings: (IBooking & { listing?: any })[] }>(
        '/bookings/my'
      ),
    cancel: (id: string, reason?: string) =>
      fetchJson<{ success: boolean; booking: IBooking; refundPreview?: any }>(
        `/bookings/${id}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      ),
  },

  // Payments & Checkout
  payments: {
    createOrder: (bookingId: string) =>
      fetchJson<{
        success: boolean;
        orderId: string;
        amountPaise: number;
        currency: string;
        bookingNumber: string;
        keyId: string;
        isMock: boolean;
      }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      }),
    verify: (data: {
      bookingId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) =>
      fetchJson<{ success: boolean; booking: IBooking; payment: IPayment }>(
        '/payments/verify',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },

  // Provider
  provider: {
    register: (data: any) =>
      fetchJson<{ success: boolean; provider: IProvider }>('/providers/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyProfile: () =>
      fetchJson<{ success: boolean; provider: IProvider; listings: IListing[] }>(
        '/providers/me'
      ),
    getDashboardMetrics: () =>
      fetchJson<{
        success: boolean;
        metrics: {
          totalParkingBookings: number;
          totalChargingSessions: number;
          completedBookings: number;
          cancelledBookings: number;
          grossRevenuePaise: number;
          platformCommissionPaise: number;
          netEarningsPaise: number;
          pendingPayoutPaise: number;
          paidOutPaise: number;
          activeListingsCount: number;
        };
      }>('/providers/metrics'),
    getBookings: () =>
      fetchJson<{ success: boolean; bookings: (IBooking & { listing?: any })[] }>(
        '/providers/bookings'
      ),
    getPayouts: () =>
      fetchJson<{
        success: boolean;
        payouts: IPayout[];
        ledger: IFinancialLedger[];
        summary: {
          pendingNextDayPaise: number;
          paidTotalPaise: number;
          nextCutoffDate: string;
        };
      }>('/payouts/provider'),
  },

  // Nearby Hangouts
  nearby: {
    getPlaces: (lat: number, lng: number, category?: string, radiusKm: number = 3) => {
      const q = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radiusKm: String(radiusKm),
      });
      if (category) q.append('category', category);
      return fetchJson<{ success: boolean; places: IHangoutPlace[] }>(
        `/nearby?${q.toString()}`
      );
    },
  },

  // Waitlist (Valet Coming Soon)
  waitlist: {
    submit: (data: {
      name: string;
      email: string;
      phone: string;
      city: string;
      vehicleModel?: string;
      interestedIn?: string;
      notes?: string;
    }) =>
      fetchJson<{ success: boolean; message: string }>('/waitlist', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin Dashboard
  admin: {
    getOverview: () =>
      fetchJson<{
        success: boolean;
        overview: {
          totalUsers: number;
          totalProviders: number;
          pendingProviderApprovals: number;
          totalListings: number;
          pendingListingApprovals: number;
          totalBookings: number;
          grossPlatformVolumePaise: number;
          platformRevenuePaise: number;
          pendingDisbursementsPaise: number;
        };
      }>('/admin/overview'),
    getProvidersQueue: () =>
      fetchJson<{ success: boolean; providers: IProvider[] }>('/admin/providers'),
    verifyProvider: (id: string, status: 'verified' | 'rejected') =>
      fetchJson<{ success: boolean; provider: IProvider }>(
        `/admin/providers/${id}/verify`,
        {
          method: 'POST',
          body: JSON.stringify({ status }),
        }
      ),
    moderateListing: (id: string, status: 'active' | 'suspended') =>
      fetchJson<{ success: boolean; listing: IListing }>(
        `/admin/listings/${id}/moderate`,
        {
          method: 'POST',
          body: JSON.stringify({ status }),
        }
      ),
    getAuditLogs: () =>
      fetchJson<{ success: boolean; logs: any[] }>('/admin/audit-logs'),
  },
};
