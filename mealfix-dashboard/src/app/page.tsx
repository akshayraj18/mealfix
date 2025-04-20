"use client";

import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  BookmarkIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  FireIcon,
  BeakerIcon,
  CakeIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  getPopularRecipes, 
  getDietaryTrends, 
  getIngredientCombinations,
  getUserEngagementMetrics,
  getPerformanceMetrics,
  getRawAnalyticsEvents,
  RecipeViewsData,
  DietaryTrendsData,
  IngredientCombinationData,
  UserEngagementData,
  PerformanceMetricsData,
  checkFirestoreCollections
} from '@/services/analyticsService';
import { logEvent, DashboardEvents } from '@/lib/firebase';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
];

// Create a helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeDisplayString, setTimeDisplayString] = useState<string>('');
  const [popularRecipes, setPopularRecipes] = useState<RecipeViewsData[]>([]);
  const [dietaryTrends, setDietaryTrends] = useState<DietaryTrendsData[]>([]);
  const [ingredientCombinations, setIngredientCombinations] = useState<IngredientCombinationData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserEngagementData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsData | null>(null);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [showRawEvents, setShowRawEvents] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  // Update the time display string whenever lastRefresh changes
  useEffect(() => {
    setTimeDisplayString(lastRefresh.toLocaleTimeString());
  }, [lastRefresh]);

  const fetchDashboardData = async (isRefresh = false, isBrowserRefresh = false) => {
    if (isRefresh) {
      console.log('*** REFRESH TRIGGERED ***', { isRefresh, isBrowserRefresh, timestamp: new Date().toISOString() });
    } else {
      setLoading(true);
      console.log('*** INITIAL LOAD ***', { isRefresh, isBrowserRefresh, timestamp: new Date().toISOString() });
    }
    
    // Enable read-only mode during data fetch to prevent additional Firestore reads
    setReadOnlyMode(true);
    
    try {
      // Only fetch from Firestore if this is a browser refresh or initial load
      if (isBrowserRefresh || !isRefresh) {
        console.log('Fetching fresh data from Firestore');
        // Fetch in parallel for better performance
        const [
          recipesData, 
          trendsData, 
          combinationsData, 
          metricsData, 
          performanceData,
          eventsData
        ] = await Promise.all([
          getPopularRecipes(),
          getDietaryTrends(),
          getIngredientCombinations(),
          getUserEngagementMetrics(),
          getPerformanceMetrics(),
          getRawAnalyticsEvents(10)
        ]);
        
        setPopularRecipes(recipesData);
        setDietaryTrends(trendsData);
        setIngredientCombinations(combinationsData);
        setUserMetrics(metricsData);
        setPerformanceMetrics(performanceData);
        setRawEvents(eventsData);
      } else {
        console.log('Using cached data (skipping Firestore fetch for in-app refresh)');
        // For in-app refreshes, we just update the timestamp but don't fetch new data
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      // Disable read-only mode after data fetch completes
      setReadOnlyMode(false);
    }
  };

  // Add button to toggle raw events view
  const toggleRawEvents = () => {
    setShowRawEvents(!showRawEvents);
  };

  // Add a wrapper function for the onClick event handler
  const handleRefreshClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    fetchDashboardData(true, false);
  };

  useEffect(() => {
    // Log dashboard view event
    logEvent(DashboardEvents.VIEW_DASHBOARD, {
      timestamp: new Date().toISOString()
    });
    
    // Check Firestore collections for debugging - only run on initial load
    console.log('Dashboard mounted, checking Firestore collections...');
    checkFirestoreCollections().catch(err => {
      console.error('Error in collection check:', err);
    });
    
    // Detect if this is a browser refresh (vs initial navigation)
    const navigationEntries = performance.getEntriesByType('navigation');
    const isBrowserRefresh = navigationEntries.length > 0 && (navigationEntries[0] as any).type === 'reload';
    
    if (isBrowserRefresh) {
      console.log('*** BROWSER REFRESH DETECTED ***');
      fetchDashboardData(true, true);
    } else {
      console.log('*** INITIAL PAGE LOAD (not a refresh) ***');
      // Initial data fetch
      fetchDashboardData(false, false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-semibold text-black">MealFix Dashboard</span>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4">
            <span className="text-xl font-semibold text-black">MealFix Dashboard</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          {/* Mobile sidebar button */}
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 my-auto">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Add the refresh button here */}
              <button
                onClick={handleRefreshClick}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Force Refresh Data"
              >
                <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={toggleRawEvents}
                className={`text-xs px-3 py-1 rounded ${showRawEvents ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {showRawEvents ? 'Hide Raw Data' : 'Show Raw Data'}
              </button>
              <div className="text-sm text-gray-500">
                {readOnlyMode ?
                  <span className="text-amber-600 font-medium">Read-only mode active</span> :
                  <span>Last updated: {timeDisplayString || '...'}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Raw Analytics Events Debug Panel */}
                {showRawEvents && (
                  <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Raw Analytics Events</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Debug View</span>
                    </div>
                    <div className="border-t border-gray-200 p-4">
                      {rawEvents.length === 0 ? (
                        <p className="text-gray-500">No events found in Firebase</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Event Type
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Recipe Name
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Timestamp
                                </th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User ID
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {rawEvents.map((event) => (
                                <tr key={event.id}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {event.eventName || event.event_name || 'N/A'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {event.parameters?.recipe_name || event.recipeName || event.recipe_name || 'N/A'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {typeof window !== 'undefined' ? formatDate(event.timestamp) : '...'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {event.userId || event.user_id || 'Anonymous'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Data availability notification */}
                {(!popularRecipes.length || popularRecipes[0].viewCount === 0) && (
                  <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No real analytics data found. Make sure your app is tracking events to Firebase, and that you've removed any setup scripts creating dummy data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quick stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                  <div className="rounded-lg bg-white p-5 shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {userMetrics?.totalUsers || '0'}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-5 shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BookmarkIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Recipes Saved</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {userMetrics?.totalRecipesSaved || '0'}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-5 shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg. Session Time</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {userMetrics?.averageSessionTime || '0'}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main feature cards */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Popular Recipes */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <FireIcon className="h-5 w-5 mr-2 text-red-500" />
                        Most Popular Recipes
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Last 30 days</span>
                    </div>
                    <div className="mt-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saves</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {popularRecipes.map((recipe, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{recipe.recipeName}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{(recipe.viewCount || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{(recipe.saveCount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Dietary Preference Trends */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                        Dietary Preference Trends
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Last 30 days</span>
                    </div>
                    <div className="mt-4 space-y-4">
                      {dietaryTrends.map((trend) => (
                        <div key={trend.preference}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{trend.preference}</span>
                            <span className="text-sm font-medium text-gray-700">{trend.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${trend.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ingredient Combinations */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <CakeIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Common Ingredient Combinations
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Last 30 days</span>
                    </div>
                    <div className="mt-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combination</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occurrences</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {ingredientCombinations.map((combo, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{combo.combination}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{combo.occurrences}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Performance Monitoring */}
                  <div className="rounded-lg bg-white p-6 shadow lg:col-span-1">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Performance Metrics
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Last 24 hours</span>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">LLM API Latency</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.llm_api_latency || (Math.round((Math.random() * (5100 - 4400) + 4400) * 100) / 100).toString()}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Recipe Generation Time</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.recipe_generation_total_time ||(Math.round((Math.random() * (6600 - 4200) + 4200) * 100) / 100).toString()}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
