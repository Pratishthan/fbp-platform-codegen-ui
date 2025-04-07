import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page'; // Import the component to test

// Mock next/link if needed, though not strictly necessary for this simple test
// jest.mock('next/link', () => {
//   return ({ children, href }: { children: React.ReactNode, href: string }) => {
//     return <a href={href}>{children}</a>;
//   };
// });

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);

    // Find the heading element
    // Using role 'heading' with level 1 (h1) and checking its name (accessible text content)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: /welcome to the feature specification creator/i, // Case-insensitive regex match
    });

    // Assert that the heading is in the document
    expect(heading).toBeInTheDocument();
  });

  it('renders the introductory paragraph', () => {
    render(<Home />);

    // Find text within the component
    const introText = screen.getByText(
      /this tool helps you define openapi and entity specifications/i // Match part of the text
    );

    expect(introText).toBeInTheDocument();
  });

  // Add more tests as needed, e.g., for the presence of the placeholder link comment
});
