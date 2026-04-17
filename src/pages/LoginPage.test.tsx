import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
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

import userEvent from '@testing-library/user-event';

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

    it('submits form correctly on valid inputs via userEvent', async () => {
        mockLogin.mockResolvedValueOnce(undefined);
        const user = userEvent.setup();

        render(<BrowserRouter><LoginPage /></BrowserRouter>);
        
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPass123!');
        
        await user.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
        });
    });

    it('can toggle to signup form using userEvent click', async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><LoginPage /></BrowserRouter>);

        // It starts with Login
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

        // Click the toggle button to 'Sign up'
        const toggleButton = screen.getByText(/Sign up/i, { selector: 'button' });
        await user.click(toggleButton);

        // It should now show Create an account UI and the Login toggle
        await waitFor(() => {
            expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Login/i })).not.toBeInTheDocument(); // The main submit button is now Create Account
            expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
        });
    });
});
