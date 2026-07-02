import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Tâche test',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
		expect(screen.getByText('Tâche test')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
	});

	it('calls onToggle when checkbox clicked', () => {
		const onToggle = vi.fn();
		render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('requires confirmation before delete', () => {
		const onDelete = vi.fn();
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
		const deleteBtn = screen.getByLabelText('Supprimer');
		fireEvent.click(deleteBtn);
		expect(onDelete).not.toHaveBeenCalled();
		fireEvent.click(deleteBtn);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('enters edit mode and saves changes', () => {
		const onEdit = vi.fn();
		render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Titre modifié' } });
		fireEvent.click(screen.getByText('Enregistrer'));
		expect(onEdit).toHaveBeenCalledWith(1, { title: 'Titre modifié', description: 'Une description' });
	});
});