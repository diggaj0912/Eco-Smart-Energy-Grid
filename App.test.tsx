import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as geminiService from './services/geminiService';

// Declare Jest globals
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: any;
declare const jest: any;
declare const beforeEach: (fn: () => void) => void;

// Mock the dependencies
jest.mock('./services/geminiService');
jest.mock('./components/GridVisuals', () => () => <div data-testid="mock-grid-visuals">Grid Visuals</div>);
jest.mock('./components/MapPanel', () => () => <div data-testid="mock-map-panel">Map Panel</div>);

const mockSendMessage = geminiService.sendMessageToGemini as unknown as any;
const mockInit = geminiService.initializeGemini as unknown as any;

describe('Eco-Smart Energy Grid - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInit.mockResolvedValue({});
  });

  test('FULL FLOW: Renders Login -> Authenticates -> Shows Dashboard', async () => {
    // 1. Initial Render (Login Screen Expected)
    mockSendMessage.mockResolvedValue('[LOGIN_SCREEN]');
    render(<App />);
    
    expect(screen.getByText(/SECURE ACCESS/i)).toBeInTheDocument();
    
    // 2. Perform Login
    const emailInput = screen.getByLabelText(/OPERATOR ID/i);
    const passInput = screen.getByLabelText(/PASSCODE/i);
    const loginBtn = screen.getByRole('button', { name: /ESTABLISH UPLINK/i });

    fireEvent.change(emailInput, { target: { value: 'admin@grid.city' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    mockSendMessage.mockResolvedValue('[GRID_IDLE] System is IDLE.');
    fireEvent.click(loginBtn);

    // 3. Verify Dashboard Loaded
    await waitFor(() => {
      expect(screen.getByText(/ECO-SMART/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // 4. Check for Lazy Loaded components
    expect(await screen.findByTestId('mock-grid-visuals')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-map-panel')).toBeInTheDocument();
  });

  test('SECURITY: Prevents empty login submission', () => {
    mockSendMessage.mockResolvedValue('[LOGIN_SCREEN]');
    render(<App />);

    const loginBtn = screen.getByRole('button', { name: /ESTABLISH UPLINK/i });
    fireEvent.click(loginBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/Credentials required/i);
    expect(mockSendMessage).not.toHaveBeenCalledWith(expect.stringContaining('LOGIN_CREDENTIALS'));
  });

  test('OPERATIONS: Handles Operational Alerts correctly', async () => {
    // Setup state as if logged in
    mockSendMessage.mockResolvedValueOnce('[GRID_IDLE]'); 
    render(<App />);

    // Simulate START command response with new STRICT FORMAT
    const operationalResponse = `
      GRID_OVERVIEW
      System is operational.
      
      [LIVE_ALERT]
      Timestamp: 12:00:00
      District: Downtown
      AlertType: Demand
      Severity: High
      Description: Grid overload imminent.
      [/LIVE_ALERT]
      
      [AI_RECOMMENDATION]
      Summary: Shed load immediately.
      Reasoning: Demand exceeds supply by 15%.
      ExpectedImpact: Prevent blackout.
      [/AI_RECOMMENDATION]
      
      Action A. Shed Load
      Action B. Increase Supply
      Action C. Do Nothing
    `;
    
    mockSendMessage.mockResolvedValue(operationalResponse);
    
    // Find controls (assuming we are past login for this test simulation or forcing state)
    // For integration test, we simulate the flow:
    const emailInput = screen.getByLabelText(/OPERATOR ID/i);
    fireEvent.change(emailInput, { target: { value: 'admin@grid.city' } });
    fireEvent.change(screen.getByLabelText(/PASSCODE/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /ESTABLISH UPLINK/i }));

    await waitFor(() => {
       // Now we are in IDLE, click START
       const startBtn = screen.getByText(/START SYSTEM/i);
       fireEvent.click(startBtn);
    });

    // Expect Alert to appear
    await waitFor(() => {
      expect(screen.getByText(/LIVE ALERT: DEMAND/i)).toBeInTheDocument();
      expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument(); // High severity = Critical
    });
  });
});