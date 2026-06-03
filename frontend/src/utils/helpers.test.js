import { describe, it, expect } from 'vitest';
import { formatDate, calculateStreak, getProductivityScore, getConsistencyScore, validateEmail } from './helpers';

describe('helpers', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      // Mocking the timezone/locale could be necessary depending on the environment,
      // but for standard JS dates it should return the expected format 'MMM D, YYYY'.
      const dateString = '2023-10-15T00:00:00.000Z';
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/Oct 15, 2023|Oct 14, 2023/); // Adjusting for timezone variations during tests if necessary
    });
  });

  describe('calculateStreak', () => {
    it('returns 0 if no completed days', () => {
      expect(calculateStreak(0)).toBe(0);
      expect(calculateStreak(null)).toBe(0);
      expect(calculateStreak(undefined)).toBe(0);
    });

    it('returns the completed days as streak', () => {
      expect(calculateStreak(5)).toBe(5);
    });
  });

  describe('getProductivityScore', () => {
    it('returns 0 if no data or empty data', () => {
      expect(getProductivityScore(null)).toBe(0);
      expect(getProductivityScore([])).toBe(0);
    });

    it('calculates the average productivity correctly', () => {
      const data = [{ productivity: 80 }, { productivity: 90 }, { productivity: 100 }];
      expect(getProductivityScore(data)).toBe(90);
    });
    
    it('rounds the average productivity correctly', () => {
      const data = [{ productivity: 80 }, { productivity: 90 }, { productivity: 92 }];
      expect(getProductivityScore(data)).toBe(87); // 262 / 3 = 87.333
    });
  });

  describe('getConsistencyScore', () => {
    it('returns 0 if no habits or empty habits', () => {
      expect(getConsistencyScore(null)).toBe(0);
      expect(getConsistencyScore([])).toBe(0);
    });

    it('calculates the percentage of completed habits correctly', () => {
      const habits = [{ completed: true }, { completed: false }, { completed: true }, { completed: false }];
      expect(getConsistencyScore(habits)).toBe(50);
    });
    
    it('rounds the consistency score correctly', () => {
      const habits = [{ completed: true }, { completed: false }, { completed: false }];
      expect(getConsistencyScore(habits)).toBe(33); // 1/3 * 100 = 33.333
    });
  });

  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test.com')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });
});
