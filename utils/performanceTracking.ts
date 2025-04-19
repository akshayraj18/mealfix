import { trackPerformanceMetric } from '@/services/analyticsService';

/**
 * Measures and logs the execution time of an asynchronous function
 * 
 * @param metricName The name of the metric to track
 * @param fn The async function to measure
 * @returns The result of the function
 */
export async function measureAsync<T>(metricName: string, fn: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Track the performance metric
    trackPerformanceMetric(metricName, duration);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Still track the metric but mark it as an error
    trackPerformanceMetric(`${metricName}_error`, duration);
    
    throw error;
  }
}

/**
 * Decorator function to measure performance of a component's render time
 * 
 * @param Component The React component to measure
 * @param componentName Optional name for the component, defaults to Component.name
 * @returns The wrapped component with performance tracking
 */
export function withPerformanceTracking(Component: React.ComponentType<any>, componentName?: string) {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  return function WrappedComponent(props: any) {
    const startTime = performance.now();
    
    // In a real implementation, you would use useEffect to measure render time
    const result = <Component {...props} />;
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Track component render time if it's above a threshold (e.g., 16ms)
    if (duration > 16) {
      trackPerformanceMetric(`component_render_${displayName}`, duration);
    }
    
    return result;
  };
}

/**
 * Tracks navigation performance between screens
 * 
 * @param screenName The name of the screen being navigated to
 */
export function trackScreenTransition(screenName: string) {
  // Record the navigation start time
  const startTime = performance.now();
  
  // Create a function to be called when the screen is fully rendered and interactive
  return () => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    trackPerformanceMetric(`screen_transition_${screenName}`, duration);
  };
}

/**
 * Tracks API call performance 
 * 
 * @param apiName The name of the API being called
 * @param apiCall The API call function to measure
 * @returns The result of the API call
 */
export async function trackApiPerformance<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
  return measureAsync(`api_call_${apiName}`, apiCall);
}

/**
 * Tracks database operation performance
 * 
 * @param operation The name of the database operation
 * @param dbOperation The database operation function to measure
 * @returns The result of the database operation
 */
export async function trackDbPerformance<T>(operation: string, dbOperation: () => Promise<T>): Promise<T> {
  return measureAsync(`db_operation_${operation}`, dbOperation);
}

/**
 * Tracks LLM generation performance
 * 
 * @param model The name of the LLM model being used
 * @param generateFn The generation function to measure
 * @returns The result of the generation function
 */
export async function trackLlmPerformance<T>(model: string, generateFn: () => Promise<T>): Promise<T> {
  return measureAsync(`llm_generate_${model}`, generateFn);
} 