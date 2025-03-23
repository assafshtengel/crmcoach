
// A singleton to track actions across the application
let actionCount = 0;
let onThresholdReached: (() => void) | null = null;
const THRESHOLD = 5; // Show overlay every 5-6 actions

export function trackAction() {
  actionCount++;
  
  if (actionCount >= THRESHOLD) {
    if (onThresholdReached) {
      onThresholdReached();
    }
    actionCount = 0; // Reset counter
  }
  
  return actionCount;
}

export function registerActionThresholdCallback(callback: () => void) {
  onThresholdReached = callback;
}

export function resetActionCount() {
  actionCount = 0;
}
