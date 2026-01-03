import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect, it } from 'vitest';

vi.mock('lottie-react', () => ({
  default: (props) => <div data-testid="lottie-mock" {...props} />,
}));

import Footer from '@/components/shared/Footer';
import NotFound from '@/pages/public/NotFound';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import JobCardSkeleton from "@/components/skeletons/JobCardSkeleton";

it('Footer component should match snapshot', () => {
  const { asFragment } = render(<MemoryRouter><Footer /></MemoryRouter>);
  expect(asFragment()).toMatchSnapshot();
});

it('NotFound page should match snapshot', () => {
  const { asFragment } = render(<MemoryRouter><NotFound /></MemoryRouter>);
  expect(asFragment()).toMatchSnapshot();
});

it('About page should match snapshot', () => {
  const { asFragment } = render(<MemoryRouter><About /></MemoryRouter>);
  expect(asFragment()).toMatchSnapshot();
});
  
it('Contact page should match snapshot', () => {
  const { asFragment } = render(<MemoryRouter><Contact /></MemoryRouter>);
  expect(asFragment()).toMatchSnapshot();
});

it('JobCardSkeleton should match snapshot', () => {
  const { asFragment } = render(<JobCardSkeleton />);
  expect(asFragment()).toMatchSnapshot();
});