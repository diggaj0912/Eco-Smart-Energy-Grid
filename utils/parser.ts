import { GridState, LiveAlert, AiRecommendation } from '../types';

/**
 * Parses the raw text response from the Gemini AI model into structured application state.
 * Handles different system modes including LOGIN, IDLE, OPERATIONAL, and DIAGNOSTIC.
 * 
 * @param text - The raw string response from the AI.
 * @returns Partial<GridState> - An object containing state updates.
 */
export const parseGeminiResponse = (text: string): Partial<GridState> => {
  const updates: Partial<GridState> = {
    lastUpdate: new Date()
  };

  // Check for Login Screen
  if (text.includes('[LOGIN_SCREEN]')) {
    updates.mode = 'LOGIN';
    updates.statusSummary = 'Secure Authentication Required';
    updates.currentAlert = null;
    updates.recommendation = null;
    updates.availableActions = [];
    return updates;
  }

  // Check Mode
  if (text.includes('[GRID_IDLE]')) {
    updates.mode = 'IDLE';
    updates.statusSummary = 'System is currently IDLE. Waiting for activation.';
    updates.currentAlert = null;
    updates.recommendation = null;
    updates.availableActions = ['START'];
    return updates;
  }

  // SYSTEM DIAGNOSTICS (STATUS command)
  if (text.includes('[SYSTEM_STATUS]')) {
    updates.mode = 'DIAGNOSTIC';
    const diagMatch = text.match(/\[SYSTEM_STATUS\]([\s\S]*?)\[\/SYSTEM_STATUS\]/);
    if (diagMatch) {
        const content = diagMatch[1];
        updates.diagnostics = {
            authState: extractField(content, 'AuthState'),
            operationalState: extractField(content, 'OperationalState'),
            totalAlertsProcessed: parseInt(extractField(content, 'TotalAlertsProcessed')) || 0,
            cachedEntries: parseInt(extractField(content, 'CachedEntries')) || 0,
            lastDistrictAnalyzed: extractField(content, 'LastDistrictAnalyzed')
        };
        updates.statusSummary = `DIAGNOSTIC REPORT: ${updates.diagnostics.authState} | ${updates.diagnostics.operationalState}`;
    }
    updates.availableActions = ['RESTART', 'START']; 
  }

  // SYSTEM HEALTH (HEALTHCHECK command)
  if (text.includes('[SYSTEM_HEALTH]')) {
      const match = text.match(/\[SYSTEM_HEALTH\]([\s\S]*?)\[\/SYSTEM_HEALTH\]/);
      if (match) {
          const content = match[1];
          updates.systemHealth = {
              Authentication: extractField(content, 'Authentication'),
              Authorization: extractField(content, 'Authorization'),
              GoogleServices: extractField(content, 'GoogleServices'),
              Caching: extractField(content, 'Caching'),
              Performance: extractField(content, 'Performance'),
              Accessibility: extractField(content, 'Accessibility')
          };
          updates.statusSummary = "SYSTEM HEALTH VERIFIED: ALL SYSTEMS GO";
      }
  }

  // GOOGLE SERVICES STATUS
  if (text.includes('[GOOGLE_SERVICES_STATUS]')) {
      const match = text.match(/\[GOOGLE_SERVICES_STATUS\]([\s\S]*?)\[\/GOOGLE_SERVICES_STATUS\]/);
      if (match) {
          const content = match[1];
          updates.googleServicesStatus = {
              GoogleAIStudio: extractField(content, 'GoogleAIStudio'),
              GoogleMaps: extractField(content, 'GoogleMaps'),
              EarthEngine: extractField(content, 'EarthEngine'),
              BigQuery: extractField(content, 'BigQuery'),
              CloudMonitoring: extractField(content, 'CloudMonitoring'),
          };
          updates.statusSummary = "GOOGLE SERVICES ACTIVE.";
      }
  }

  // Assume OPERATIONAL if we see alerts or recommendations
  if (text.includes('[LIVE_ALERT]') || text.includes('[AI_RECOMMENDATION]')) {
    updates.mode = 'OPERATIONAL';
    
    // Parse Alert
    const alertMatch = text.match(/\[LIVE_ALERT\]([\s\S]*?)\[\/LIVE_ALERT\]/);
    if (alertMatch) {
      const alertContent = alertMatch[1];
      
      // Try new prompt fields first, fallback to old
      let alertType = extractField(alertContent, 'AlertType');
      if (alertType === 'Unknown') alertType = extractField(alertContent, 'Type');

      let alertDesc = extractField(alertContent, 'Description');
      if (alertDesc === 'Unknown') alertDesc = extractField(alertContent, 'Message');

      const locString = extractField(alertContent, 'Location');
      let location = undefined;
      if (locString && locString !== 'Unknown') {
        const parts = locString.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            location = { lat: parts[0], lng: parts[1] };
        }
      }

      updates.currentAlert = {
        timestamp: extractField(alertContent, 'Timestamp'),
        district: extractField(alertContent, 'District'),
        location: location,
        type: alertType,
        severity: extractField(alertContent, 'Severity') as 'Low' | 'Medium' | 'High',
        message: alertDesc,
      };
    }

    // Parse Recommendation
    const recMatch = text.match(/\[AI_RECOMMENDATION\]([\s\S]*?)\[\/AI_RECOMMENDATION\]/);
    if (recMatch) {
      const recContent = recMatch[1];
      
      // Handle new ExpectedImpact field, fallback to Impact
      let impact = extractField(recContent, 'ExpectedImpact');
      if (impact === 'Unknown') impact = extractField(recContent, 'Impact');

      updates.recommendation = {
        summary: extractField(recContent, 'Summary'),
        reasoning: extractField(recContent, 'Reasoning'),
        impact: impact,
      };
    }

    // Parse Summary (The text before the first block, usually)
    const lines = text.split('\n');
    let summaryLines = [];
    for (const line of lines) {
        if (line.includes('[LIVE_ALERT]')) break;
        if (line.includes('[SYSTEM_HEALTH]')) break;
        if (line.includes('[GOOGLE_SERVICES_STATUS]')) break;
        if (line.trim().length > 0 && !line.includes('[GRID_IDLE]') && !line.includes('[SYSTEM_STATUS]')) {
             summaryLines.push(line.trim());
        }
    }
    // Filter out number prefixes like "1. "
    const sum = summaryLines.join(' ').replace(/^\d+\.\s*/, '');
    if (sum) updates.statusSummary = sum;

    // Parse Actions
    const actions: string[] = [];
    const actionRegex = /^[A-C][\.\)\:]\s*(.+)/gm;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      actions.push(match[1].trim());
    }
    
    // Fallback if strict regex fails but lines exist
    if (actions.length === 0) {
       const looseActionRegex = /Action\s+[A-C]\s*[\:\-]\s*(.+)/gi;
       while ((match = looseActionRegex.exec(text)) !== null) {
         actions.push(match[1].trim());
       }
    }

    if (actions.length > 0) {
        updates.availableActions = actions;
    }
  }

  return updates;
};

/**
 * Helper to extract specific fields from a structured text block.
 * @param block - The text block to search within.
 * @param fieldName - The key to search for (e.g., "Severity").
 * @returns The extracted value or 'Unknown'.
 */
const extractField = (block: string, fieldName: string): string => {
  const regex = new RegExp(`${fieldName}:\\s*(.+)`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : 'Unknown';
};