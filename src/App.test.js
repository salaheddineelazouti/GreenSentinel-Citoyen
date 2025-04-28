import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders GreenSentinel title', () => {
    render(<App />);
    const titleElement = screen.getByText(/GreenSentinel/i);
    expect(titleElement).toBeInTheDocument();
  });
});
