import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import * as storeModule from '../store';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

// Mock client from store
vi.mock('../store', async () => {
    const actual = await vi.importActual('../store') as any;
    return {
        ...actual,
        useStore: vi.fn(),
        client: {
            admin: {
                users: {
                    get: vi.fn().mockResolvedValue({
                        data: {
                            users: [
                                { id: 'u1', name: 'Test User', email: 'test@t.com', isAdmin: false, isBanned: false, createdAt: '2023', projectsCount: 1, boardsCount: 1 }
                            ],
                            stats: {
                                totalUsers: 10,
                                totalProjects: 5,
                                totalBoards: 15,
                                totalCards: 50,
                                totalLists: 20
                            }
                        }
                    })
                }
            }
        }
    };
});

describe('AdminPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
            return selector({
                user: { id: 'u1', isAdmin: true },
                checkAuth: vi.fn()
            });
        });
    });

    it('renders admin dashboard and stats', async () => {
        render(<BrowserRouter><AdminPage /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument(); // 10 total users from our mock sum
            expect(screen.getByText('Total Projects')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });
});
