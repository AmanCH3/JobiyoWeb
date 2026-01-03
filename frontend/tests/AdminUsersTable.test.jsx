import { render, screen } from '@testing-library/react';
import AdminUsersTable from '@/pages/admin/AdminUsersTable';
import { MemoryRouter } from 'react-router-dom';

const mockUsers = [
  { _id: '1', fullName: 'Alice', email: 'alice@test.com', role: 'student', createdAt: new Date().toISOString() },
  { _id: '2', fullName: 'Bob', email: 'bob@test.com', role: 'recruiter', createdAt: new Date().toISOString() },
  { _id: '3', fullName: 'Charlie', email: 'charlie@test.com', role: 'admin', createdAt: new Date().toISOString() },
];

describe('AdminUsersTable', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AdminUsersTable users={mockUsers} />
      </MemoryRouter>
    );
  });

  it('renders a row for each user', () => {
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
  });

  it('displays the full name and email for each user', () => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('displays a role badge for each user', () => {
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('recruiter')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('displays the registration date in the correct format', () => {
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
    const dateElements = screen.getAllByText(formattedDate);
    expect(dateElements.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the table headers correctly', () => {
    expect(screen.getByRole('columnheader', { name: 'Full Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Registered On' })).toBeInTheDocument();
  });
});