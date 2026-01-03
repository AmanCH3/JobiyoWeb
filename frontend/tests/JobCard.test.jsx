import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import JobCard from '@/pages/public/JobCard';

const mockJob = {
    _id: '1',
    title: 'Frontend Developer',
    salary: 120000,
    location: 'Remote',
    jobType: 'Full-time',
    company: { name: 'Tech Solutions', logo: '/logo.png' },
};

describe('JobCard Component', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <JobCard job={mockJob} />
            </MemoryRouter>
        );
    });

    it('should render the job title and company name', () => {
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
        expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    });

    it('should render job details like location, type, and salary', () => {
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('Full-time')).toBeInTheDocument();
        
        const salaryElement = screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'div' && content.startsWith('Rs.');
        });
        
        expect(salaryElement).toBeInTheDocument();
        expect(salaryElement.textContent).toBe('Rs. 120000');
    });

    it('should render a link that points to the correct job details page', () => {
        const link = screen.getByRole('link', { name: /View Details/i });
        expect(link).toHaveAttribute('href', '/jobs/1');
    });
});