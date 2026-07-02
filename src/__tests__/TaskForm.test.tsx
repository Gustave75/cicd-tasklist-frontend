import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('submits with title and description', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Ma tâche' } });
		fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Détail' } });
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).toHaveBeenCalledWith({ title: 'Ma tâche', description: 'Détail' });
	});

	it('shows validation error when title is empty', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.submit(screen.getByTestId('task-form'));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('calls onCancel when cancel button clicked', () => {
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		fireEvent.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});
});