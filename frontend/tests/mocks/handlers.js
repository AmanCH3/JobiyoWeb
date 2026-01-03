import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/v1/users/login', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: { _id: 'user1', fullName: 'Test User', email: 'test@user.com', role: 'student' },
        accessToken: 'mock-token',
      },
    });
  }),

  http.get('/api/v1/jobs/public', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobs: [
          { _id: 'job1', title: 'React Developer', salary: 150000, location: 'Kathmandu', jobType: 'Full-time', company: { name: 'Mock Co', logo: '/logo.png' } },
          { _id: 'job2', title: 'Node.js Engineer', salary: 180000, location: 'Pokhara', jobType: 'Full-time', company: { name: 'Backend Inc', logo: '/logo.png' } },
        ],
        totalPages: 1,
      }
    });
  }),
];