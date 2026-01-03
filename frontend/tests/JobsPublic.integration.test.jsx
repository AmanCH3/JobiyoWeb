import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import JobsPublic from '@/pages/public/Jobs';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';

const TestWrapper = ({ children }) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/jobs']}>
      <Routes>
        <Route path="/jobs" element={children} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('JobsPublic Page Integration', () => {
  
  it('should display an error message if the API call fails', async () => {
    server.use(http.get('/api/v1/jobs/public', () => { return new HttpResponse(null, { status: 500 })}));
    render(<TestWrapper><JobsPublic /></TestWrapper>);
    expect(await screen.findByText(/Failed to load jobs/i)).toBeInTheDocument();
  });
});