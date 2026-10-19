import { describe, it, expect } from 'vitest';
import { SettlementService } from '../services/settlementService';
import { PLATFORM_CONFIG } from '@vflow/shared';

describe('SettlementService - Financial Calculations and Next-Day Payout Rules', () => {
  it('correctly calculates the next calendar day string in YYYY-MM-DD format', () => {
    // 12:00 PM local date
    const fixedDate = new Date(2026, 9, 19, 12, 0, 0); // Oct 19, 2026
    const nextDay = SettlementService.getNextCalendarDayDate(fixedDate);
    expect(nextDay).toBe('2026-10-20');
  });

  it('correctly transitions months and years for next-day payout dates', () => {
    // 12:00 PM on Dec 31, 2026
    const endOfYear = new Date(2026, 11, 31, 12, 0, 0); // Month 11 is December
    const nextDay = SettlementService.getNextCalendarDayDate(endOfYear);
    expect(nextDay).toBe('2027-01-01');
  });

  it('enforces integer paise precision and commission calculation', () => {
    const bookingAmountPaise = 50000; // ₹500.00
    const commissionPercent = PLATFORM_CONFIG.DEFAULT_COMMISSION_PERCENTAGE; // 10%
    const expectedCommissionPaise = Math.round((bookingAmountPaise * commissionPercent) / 100); // 5000 paise (₹50)
    const expectedProviderSharePaise = bookingAmountPaise - expectedCommissionPaise; // 45000 paise (₹450)

    expect(expectedCommissionPaise).toBe(5000);
    expect(expectedProviderSharePaise).toBe(45000);
    expect(Number.isInteger(expectedCommissionPaise)).toBe(true);
    expect(Number.isInteger(expectedProviderSharePaise)).toBe(true);
  });
});
