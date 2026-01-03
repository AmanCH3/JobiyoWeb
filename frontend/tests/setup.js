import '@testing-library/jest-dom';
import { server } from './mocks/server.js';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());