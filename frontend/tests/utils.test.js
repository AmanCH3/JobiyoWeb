import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils'; 

describe('Utility Functions', () => {
    it('cn function should merge tailwind classes correctly', () => {
        const result = cn('bg-red-500', 'text-white', { 'font-bold': true, 'p-4': false });
        expect(result).toBe('bg-red-500 text-white font-bold');
    });

    it('cn function should handle conflicting classes correctly', () => {
        const result = cn('p-2', 'p-4');
        expect(result).toBe('p-4');
    });
});