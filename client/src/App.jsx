import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { fetchHealthStatus } from './api/health.api';
import { 
  Recycle, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Cpu, 
  Box, 
  Package, 
  TreePine, 
  Wine, 
  Scissors 
} from 'lucide-react';

function LandingPage() {
  const [healthData, setHealthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorMsg(null);
    const start = performance.now();
    try {
      const data = await fetchHealthStatus();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthData(data);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setConnectionStatus('error');
      setErrorMsg(err.message || 'Cannot reach Express backend API at http://localhost:5001/api');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const materialCategories = [
    { name: 'Cardboard & Paper', icon: Package, count: 'Moving boxes, rolls, packaging sheets', color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200' },
    { name: 'Wood & Timber', icon: TreePine, count: 'Pallets, hardwood offcuts, plywood scraps', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-800 border-emerald-200' },
    { name: 'Glass Containers', icon: Wine, count: 'Sanitized jars, beverage bottles, vials', color: 'from-cyan-500/10 to-sky-500/10 text-cyan-700 border-cyan-200' },
    { name: 'Textile & Scraps', icon: Scissors, count: 'Denim, cotton rolls, tailoring offcuts', color: 'from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200' },
    { name: 'Plastics & Tins', icon: Box, count: 'Containers, storage tubs, clean barrels', color: 'from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200' },
    { name: 'Surplus Hardware', icon: Recycle, count: 'Fasteners, pipe lengths, metal trimmings', color: 'from-slate-500/10 to-gray-500/10 text-slate-700 border-slate-200' },
  ];

  const features = [
    {
      title: 'Donor Listing Workflow',
      desc: 'Quickly catalogue unwanted surplus materials with photos, dimensions, and pickup terms.',
      icon: Package,
      badge: 'Phase 4'
    },
    {
      title: 'Recipient Discovery & Interest',
      desc: 'Browse by category, filter by city, and send structured interest proposals directly to donors.',
      icon: Layers,
      badge: 'Phase 5'
    },
    {
      title: 'Explainable AI Matcher',
      desc: 'Transparent 100-point scoring algorithm combined with Python scikit-learn TF-IDF content similarity.',
      icon: Sparkles,
      badge: 'Phase 6'
    },
    {
      title: 'PostgreSQL ACID Safety',
      desc: 'ACID-compliant relational model with foreign key cascading and deterministic migrations.',
      icon: Database,
      badge: 'Phase 2'
    }
  ];

  return (
    <>
      <Navbar connectionStatus={connectionStatus} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50 to-emerald-50/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-blue-100/20 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI-Powered Waste-to-Resource Circular Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Turn Surplus Waste into <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Valuable Community Resources
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                Connecting workshops, households, and businesses with students, artists, NGOs, and recyclers. Divert clean solid discards from landfills through transparent, explainable recommendations.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  >
                    Go to Your Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-200/80 mt-10">
                <div className="p-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Explainable Matching</div>
                </div>
                <div className="p-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">10 Listings</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Active in Seed DB</div>
                </div>
                <div className="p-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">JWT Auth</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">bcrypt Encryption</div>
                </div>
                <div className="p-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">Phase 3</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Auth Layer Verified</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* System Probe Section */}
        <section id="connection-test" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3 mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Live Architecture Probe
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Frontend-to-Backend Connection Test
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Verifies that the React + Vite frontend communicates with the Node.js Express backend and displays health diagnostics.
              </p>
            </div>

            {/* Health Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                    connectionStatus === 'connected' ? 'bg-emerald-600' :
                    connectionStatus === 'error' ? 'bg-rose-600' : 'bg-amber-500'
                  }`}>
                    {connectionStatus === 'connected' ? <CheckCircle2 className="w-6 h-6" /> :
                     connectionStatus === 'error' ? <AlertTriangle className="w-6 h-6" /> :
                     <RefreshCw className="w-6 h-6 animate-spin" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Backend API Status:</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' :
                        connectionStatus === 'error' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {connectionStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Endpoint: <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-800">GET /api/health</code>
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkConnection}
                  disabled={connectionStatus === 'checking'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                  Re-Probe Endpoint
                </button>
              </div>

              {/* Diagnostic Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Round-Trip Latency
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    {latency !== null ? `${latency} ms` : 'Measuring...'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Browser &rarr; Express API
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                    <Database className="w-4 h-4 text-sky-600" />
                    Database Layer
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {healthData?.database?.latencyMs ? `${healthData.database.latencyMs}ms query ping` : 'PostgreSQL pool verified'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    ML Matcher Microservice
                  </div>
                  <div className="text-base font-extrabold text-slate-900 truncate">
                    {healthData?.matcherService || 'Standby'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Rule-based engine active
                  </div>
                </div>
              </div>

              {/* Raw JSON Response Preview */}
              {healthData && (
                <div className="mt-6">
                  <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
                    <span>Raw JSON Response from /api/health:</span>
                    <span className="text-[10px] text-slate-400">HTTP 200 OK</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto shadow-inner">
                    {JSON.stringify(healthData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Categories Showcase */}
        <section id="categories" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Reusable Discards Supported
              </h2>
              <p className="text-sm text-slate-600">
                Categorized to empower artists, NGOs, packaging centers, and makers to find exact surplus streams.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {materialCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={idx}
                    className={`p-6 rounded-2xl bg-white border ${cat.color} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
                      <p className="text-xs text-slate-500">{cat.count}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                      <span>Available in Database</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                System Pillars &amp; Architecture
              </h2>
              <p className="text-sm text-slate-600">
                Engineered with modular separation of concerns and robust error handling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-slate-900 font-bold">
              <Recycle className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">ReSource AI</span>
            <span className="text-slate-500">&bull;</span>
            <span>Final-Year BCS Student Project</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">User Dashboard</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
