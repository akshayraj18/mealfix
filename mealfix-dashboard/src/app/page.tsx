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
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  getPopularRecipes, 
  getDietaryTrends, 
  getIngredientCombinations,
  getUserEngagementMetrics,
  getPerformanceMetrics,
  RecipeViewsData,
  DietaryTrendsData,
  IngredientCombinationData,
  UserEngagementData,
  PerformanceMetricsData
} from '@/services/analyticsService';
import { 
  getABTests, 
  ABTest,
  ABTestStatus
} from '@/services/featureFlagService';
import { logEvent, DashboardEvents } from '@/lib/firebase';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Saved Recipes', href: '#', icon: BookmarkIcon, current: false },
  { name: 'Users', href: '#', icon: UserGroupIcon, current: false },
  { name: 'Analytics', href: '#', icon: ChartBarIcon, current: false },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popularRecipes, setPopularRecipes] = useState<RecipeViewsData[]>([]);
  const [dietaryTrends, setDietaryTrends] = useState<DietaryTrendsData[]>([]);
  const [ingredientCombinations, setIngredientCombinations] = useState<IngredientCombinationData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserEngagementData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsData | null>(null);
  const [abTests, setAbTests] = useState<ABTest[]>([]);

  useEffect(() => {
    // Log dashboard view event
    logEvent(DashboardEvents.VIEW_DASHBOARD, {
      timestamp: new Date().toISOString()
    });
    
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch in parallel for better performance
        const [
          recipesData, 
          trendsData, 
          combinationsData, 
          metricsData, 
          performanceData,
          testsData
        ] = await Promise.all([
          getPopularRecipes(),
          getDietaryTrends(),
          getIngredientCombinations(),
          getUserEngagementMetrics(),
          getPerformanceMetrics(),
          getABTests()
        ]);
        
        setPopularRecipes(recipesData);
        setDietaryTrends(trendsData);
        setIngredientCombinations(combinationsData);
        setUserMetrics(metricsData);
        setPerformanceMetrics(performanceData);
        setAbTests(testsData.filter(test => test.status === ABTestStatus.ACTIVE));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-semibold">MealFix Dashboard</span>
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
            <span className="text-xl font-semibold">MealFix Dashboard</span>
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
                {/* Quick stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                              {userMetrics?.totalUsers.toLocaleString()}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-5 shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FireIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {userMetrics?.activeUsers.toLocaleString()}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-5 shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BookmarkIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Recipes Saved Today</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {userMetrics?.recipesSavedCount.toLocaleString()}
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
                              {userMetrics?.averageSessionTime}
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
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{recipe.viewCount.toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{recipe.saveCount.toLocaleString()}</td>
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

                  {/* A/B Testing */}
                  <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <BeakerIcon className="h-5 w-5 mr-2 text-yellow-500" />
                        A/B Testing Results
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Active tests</span>
                    </div>
                    <div className="mt-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant A</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant B</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Improvement</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {abTests.map((test, idx) => (
                            <tr key={test.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{test.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">3.2%</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">4.7%</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">+46.9%</td>
                            </tr>
                          ))}
                          {abTests.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-4 text-sm text-center text-gray-500">
                                No active A/B tests found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Performance Monitoring */}
                  <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Performance Metrics
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Last 24 hours</span>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">API Latency</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.apiLatency}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">App Load Time</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.appLoadTime}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Error Rate</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.errorRate}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Crash Rate</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.crashRate}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 rounded-lg overflow-hidden text-center">
                        <dt className="text-sm font-medium text-gray-500 truncate">Search Latency</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{performanceMetrics?.searchLatency}</dd>
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
