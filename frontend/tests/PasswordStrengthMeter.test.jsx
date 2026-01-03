import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordStrengthMeter from '@/components/shared/PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
    it('should not render a label for an empty password', () => {
        render(<PasswordStrengthMeter password="" />);
        expect(screen.queryByText(/Weak|Medium|Strong/)).not.toBeInTheDocument();
    });

    it('should render "Weak" for a short or simple password', () => {
        render(<PasswordStrengthMeter password="123" />);
        expect(screen.getByText('Weak')).toBeInTheDocument();
        expect(screen.getByText('Weak')).toHaveClass('text-red-500');
    });

    it('should render "Medium" for a password with letters and numbers', () => {
        render(<PasswordStrengthMeter password="Password123" />);
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toHaveClass('text-yellow-500');
    });

    it('should render "Strong" for a complex password with special characters', () => {
        render(<PasswordStrengthMeter password="Password123!@#" />);
        expect(screen.getByText('Strong')).toBeInTheDocument();
        expect(screen.getByText('Strong')).toHaveClass('text-green-500');
    });

    it('should dynamically update strength as the password prop changes', () => {
        const { rerender } = render(<PasswordStrengthMeter password="abc" />);
        expect(screen.getByText('Weak')).toBeInTheDocument();

        rerender(<PasswordStrengthMeter password="StrongPassword123!" />);
        expect(screen.getByText('Strong')).toBeInTheDocument();
    });
});