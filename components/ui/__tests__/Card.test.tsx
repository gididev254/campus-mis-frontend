/**
 * Card Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Components', () => {
  describe('Card', () => {
    test('should render card with children', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      const card = screen.getByText('Card content');

      expect(card).toBeInTheDocument();
    });

    test('should render with base classes', () => {
      render(
        <Card>
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;

      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    test('should render with custom className', () => {
      render(
        <Card className="custom-class">
          <p>Content</p>
        </Card>
      );
      const card = screen.getByText('Content').parentElement;

      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    test('should render header with children', () => {
      render(
        <CardHeader>
          <h1>Header content</h1>
        </CardHeader>
      );
      const header = screen.getByText('Header content');

      expect(header).toBeInTheDocument();
    });

    test('should render with correct padding classes', () => {
      render(
        <CardHeader>
          <p>Content</p>
        </CardHeader>
      );
      const header = screen.getByText('Content').parentElement;

      expect(header).toHaveClass('p-6');
    });

    test('should render with flex column layout', () => {
      render(
        <CardHeader>
          <p>Content</p>
        </CardHeader>
      );
      const header = screen.getByText('Content').parentElement;

      expect(header).toHaveClass('flex', 'flex-col');
    });

    test('should render with custom className', () => {
      render(
        <CardHeader className="custom-class">
          <p>Content</p>
        </CardHeader>
      );
      const header = screen.getByText('Content').parentElement;

      expect(header).toHaveClass('custom-class');
    });
  });

  describe('CardTitle', () => {
    test('should render title with children', () => {
      render(
        <CardTitle>Card Title</CardTitle>
      );
      const title = screen.getByText('Card Title');

      expect(title).toBeInTheDocument();
    });

    test('should render as h3 element', () => {
      render(
        <CardTitle>Card Title</CardTitle>
      );
      const title = screen.getByText('Card Title');

      expect(title.tagName).toBe('H3');
    });

    test('should render with correct typography classes', () => {
      render(
        <CardTitle>Card Title</CardTitle>
      );
      const title = screen.getByText('Card Title');

      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    test('should render with custom className', () => {
      render(
        <CardTitle className="custom-class">Card Title</CardTitle>
      );
      const title = screen.getByText('Card Title');

      expect(title).toHaveClass('custom-class');
    });
  });

  describe('CardDescription', () => {
    test('should render description with children', () => {
      render(
        <CardDescription>Card description text</CardDescription>
      );
      const description = screen.getByText('Card description text');

      expect(description).toBeInTheDocument();
    });

    test('should render as paragraph element', () => {
      render(
        <CardDescription>Description</CardDescription>
      );
      const description = screen.getByText('Description');

      expect(description.tagName).toBe('P');
    });

    test('should render with muted text color', () => {
      render(
        <CardDescription>Description</CardDescription>
      );
      const description = screen.getByText('Description');

      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    test('should render with custom className', () => {
      render(
        <CardDescription className="custom-class">Description</CardDescription>
      );
      const description = screen.getByText('Description');

      expect(description).toHaveClass('custom-class');
    });
  });

  describe('CardContent', () => {
    test('should render content with children', () => {
      render(
        <CardContent>
          <p>Content text</p>
        </CardContent>
      );
      const content = screen.getByText('Content text');

      expect(content).toBeInTheDocument();
    });

    test('should render with correct padding', () => {
      render(
        <CardContent>
          <p>Content</p>
        </CardContent>
      );
      const content = screen.getByText('Content').parentElement;

      expect(content).toHaveClass('p-6', 'pt-0');
    });

    test('should render with custom className', () => {
      render(
        <CardContent className="custom-class">
          <p>Content</p>
        </CardContent>
      );
      const content = screen.getByText('Content').parentElement;

      expect(content).toHaveClass('custom-class');
    });
  });

  describe('CardFooter', () => {
    test('should render footer with children', () => {
      render(
        <CardFooter>
          <button>Footer Button</button>
        </CardFooter>
      );
      const footer = screen.getByRole('button');

      expect(footer).toBeInTheDocument();
    });

    test('should render with correct padding', () => {
      render(
        <CardFooter>
          <p>Footer content</p>
        </CardFooter>
      );
      const footer = screen.getByText('Footer content').parentElement;

      expect(footer).toHaveClass('p-6', 'pt-0');
    });

    test('should render with flex layout', () => {
      render(
        <CardFooter>
          <p>Content</p>
        </CardFooter>
      );
      const footer = screen.getByText('Content').parentElement;

      expect(footer).toHaveClass('flex', 'items-center');
    });

    test('should render with custom className', () => {
      render(
        <CardFooter className="custom-class">
          <p>Content</p>
        </CardFooter>
      );
      const footer = screen.getByText('Content').parentElement;

      expect(footer).toHaveClass('custom-class');
    });
  });

  describe('Complete Card Structure', () => {
    test('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    test('should render card with multiple content items', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>First paragraph</p>
            <p>Second paragraph</p>
            <p>Third paragraph</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Third paragraph')).toBeInTheDocument();
    });

    test('should render nested components correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
            <CardDescription>Main Description</CardDescription>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Nested Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nested content</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });

  describe('Card Styling Variations', () => {
    test('should render card with additional styling classes', () => {
      render(
        <Card className="bg-red-500 border-blue-500">
          <p>Styled card</p>
        </Card>
      );
      const card = screen.getByText('Styled card').parentElement;

      expect(card).toHaveClass('bg-red-500', 'border-blue-500');
    });

    test('should render header with custom spacing', () => {
      render(
        <CardHeader className="space-y-4">
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      );

      expect(screen.getByText('Title').parentElement).toHaveClass('space-y-4');
    });
  });
});
