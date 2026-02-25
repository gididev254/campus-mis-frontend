/**
 * Button Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    test('should render button with text', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    test('should render button with primary variant by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    test('should render button with secondary variant', () => {
      render(<Button variant="secondary">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    test('should render button with outline variant', () => {
      render(<Button variant="outline">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    test('should render button with ghost variant', () => {
      render(<Button variant="ghost">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    test('should render button with danger variant', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    test('should render button with small size', () => {
      render(<Button size="sm">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    test('should render button with medium size by default', () => {
      render(<Button size="md">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    test('should render button with large size', () => {
      render(<Button size="lg">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    test('should render button with custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Loading State', () => {
    test('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    test('should show loading text when isLoading is true', () => {
      render(<Button isLoading loadingText="Processing...">Click me</Button>);
      const button = screen.getByRole('button');

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    test('should show default loading text when loadingText is not provided', () => {
      render(<Button isLoading>Click me</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });

    test('should set aria-busy when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('should set aria-live when isLoading is true', () => {
      render(<Button isLoading>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Disabled State', () => {
    test('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });

    test('should have disabled styling when disabled', () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
    });
  });

  describe('User Interaction', () => {
    test('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should not call onClick handler when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should not call onClick handler when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should be focusable', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    test('should have focus-visible:ring-offset-2 class', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });

    test('should render with type="button" by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('type', 'button');
    });

    test('should render with type="submit" when specified', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Children', () => {
    test('should render complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    test('should render with icon', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          Click me
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });
});
