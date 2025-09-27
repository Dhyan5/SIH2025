import { projectId, publicAnonKey } from './supabase/info';

let serverHealthStatus: 'unknown' | 'healthy' | 'unhealthy' = 'unknown';

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 3000); // Reduced to 3 second timeout

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      serverHealthStatus = 'healthy';
      return true;
    } else {
      serverHealthStatus = 'unhealthy';
      return false;
    }
  } catch (error) {
    // Don't log AbortError as it's expected when timeout occurs
    if (error.name !== 'AbortError') {
      console.warn('Server health check failed:', error);
    }
    serverHealthStatus = 'unhealthy';
    return false;
  }
};

export const getServerHealthStatus = () => serverHealthStatus;

// Check server health on module load (non-blocking)
checkServerHealth().catch(() => {
  // Silently fail - this is expected in many cases
});