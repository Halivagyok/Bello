import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CalendarPage from './CalendarPage';
import * as storeModule from '../store';
import { format } from 'date-fns';

const fetchPersonalTasksMock = vi.fn();
const fetchBoardTasksMock = vi.fn();

vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
    return selector({
        personalTasks: [],
        boardTasks: [],
        fetchPersonalTasks: fetchPersonalTasksMock,
        fetchBoardTasks: fetchBoardTasksMock,
        createPersonalTask: vi.fn(),
        updatePersonalTask: vi.fn(),
        deletePersonalTask: vi.fn(),
        togglePersonalTask: vi.fn(),
        toggleCardCompletion: vi.fn(),
        userImages: [],
        fetchUserImages: vi.fn()
    });
});

describe('CalendarPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders basic calendar headers perfectly', () => {
        render(<BrowserRouter><CalendarPage /></BrowserRouter>);
        
        const todayStr = format(new Date(), 'MMMM d, yyyy');
        expect(screen.getByText(todayStr, { exact: false })).toBeInTheDocument();
        expect(screen.getByText(/Personal Calendar/i)).toBeInTheDocument();
    });

    it('navigates to previous day using userEvent', async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><CalendarPage /></BrowserRouter>);
        
        vi.clearAllMocks(); // Clear initial mount calls
        
        const buttons = screen.getAllByRole('button');
        const prevButton = buttons[1]; // 0 is Create New Task, 1 is prev, 2 is next
        await user.click(prevButton);

        await waitFor(() => {
            expect(fetchPersonalTasksMock).toHaveBeenCalled();
        });
    });

    it('navigates to next day using userEvent', async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><CalendarPage /></BrowserRouter>);
        
        vi.clearAllMocks();

        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[2]; 
        
        await user.click(nextButton);

        await waitFor(() => {
            expect(fetchPersonalTasksMock).toHaveBeenCalled();
        });
    });

    it('opens create task dialog correctly', async () => {
        const user = userEvent.setup();
        render(<BrowserRouter><CalendarPage /></BrowserRouter>);
        
        const createButton = screen.getByRole('button', { name: /create new task/i });
        await user.click(createButton);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/e\.g\., Morning Yoga/i)).toBeInTheDocument();
        });
    });

    it('displays empty state fallback when no tasks exist', () => {
        render(<BrowserRouter><CalendarPage /></BrowserRouter>);
        
        expect(screen.getByText(/No tasks scheduled for this day/i)).toBeInTheDocument();
    });
});
