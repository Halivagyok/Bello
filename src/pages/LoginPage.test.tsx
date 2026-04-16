import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as storeModule from '../store';

const mockLogin = vi.fn();
vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
    return selector({ login: mockLogin });
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form properly', () => {
        render(<BrowserRouter><LoginPage /></BrowserRouter>);
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('submits form correctly on valid inputs', async () => {
        mockLogin.mockResolvedValueOnce(undefined);

        render(<BrowserRouter><LoginPage /></BrowserRouter>);
        
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ValidPass123!' } });
        
        fireEvent.submit(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
        });
    });
});
