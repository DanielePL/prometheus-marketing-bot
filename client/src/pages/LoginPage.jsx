import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Rocket,
  DollarSign,
  Users,
  Globe,
  MousePointer,
  Activity,
  Shield,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Importieren Sie die neue Hilfsfunktion in Ihrer Login-Komponente
import { performDevLogin, isDevelopmentMode } from '../utils/devLoginHelper';

const ModernLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentMetric, setCurrentMetric] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Fügen Sie einen State für Fehlermeldungen hinzu
  const [errorMessage, setErrorMessage] = useState('');

  // Typing animation for headline
  const headlines = [
    'Maximize Your ROAS',
    'Scale Your Campaigns',
    'Optimize Performance',
    'Boost Conversions'
  ];

  // Animated metrics with enhanced data
  const metrics = [
    {
      label: 'ROAS Improvement',
      value: '347%',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-emerald-500/20',
      description: 'Average return increase',
      trend: '+127% vs last month'
    },
    {
      label: 'Campaign Efficiency',
      value: '89%',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      description: 'Automation success rate',
      trend: '+34% optimization'
    },
    {
      label: 'Cost Reduction',
      value: '56%',
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/20 to-yellow-500/20',
      description: 'Average CPC decrease',
      trend: '€2.8M saved annually'
    },
    {
      label: 'Happy Clients',
      value: '2.4K+',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      description: 'Active marketers',
      trend: '+156 this month'
    }
  ];

  // Enhanced features list
  const features = [
    { icon: BarChart3, label: 'Real-time Analytics', color: 'text-green-400' },
    { icon: Brain, label: 'AI Insights', color: 'text-blue-400' },
    { icon: Sparkles, label: 'Auto-Optimization', color: 'text-purple-400' },
    { icon: Shield, label: 'Secure & Reliable', color: 'text-orange-400' },
    { icon: Award, label: 'Award-Winning', color: 'text-yellow-400' },
    { icon: Activity, label: 'Live Monitoring', color: 'text-red-400' }
  ];

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typing effect
  useEffect(() => {
    const currentHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    let i = 0;
    const timer = setInterval(() => {
      if (i < currentHeadline.length) {
        setTypedText(currentHeadline.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setTypedText('');
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [typedText]);

  // Metric rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced floating particles
  const Particles = () => {
    const particles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 25,
      size: Math.random() * 3 + 1
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-gradient-to-r from-orange-400 to-purple-400 rounded-full opacity-20 hover:opacity-40 transition-opacity"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              animation: `float ${particle.duration}s ease-in-out infinite, glow 3s ease-in-out infinite alternate`,
              transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px)`
            }}
          />
        ))}
        <style>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    25% { transform: translateY(-30px) translateX(15px) rotate(90deg); }
    50% { transform: translateY(-60px) translateX(-10px) rotate(180deg); }
    75% { transform: translateY(-30px) translateX(-15px) rotate(270deg); }
  }
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.3); }
    100% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.6); }
  }
`}</style>
      </div>
    );
  };

  // innerhalb der ModernLoginPage-Komponente
  const { login } = useAuth();
  const navigate = useNavigate();

const handleDevLogin = async () => {
  try {
    // Entfernen Sie den api-Parameter oder setzen Sie ihn auf null
    const result = await performDevLogin(null, navigate, setIsLoading);
    
    if (result.success) {
      console.log('🚀 Dev Login erfolgreich!');
      // Die Navigation passiert bereits in performDevLogin
    } else {
      console.error('Dev Login fehlgeschlagen:', result.error);
      setErrorMessage('Dev Login fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    }
  } catch (error) {
    console.error('Dev Login fehlgeschlagen:', error);
    setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
  }
};

  const handleLogin = async () => {
    if (!email || !password) {
      console.error('Bitte E-Mail und Passwort eingeben');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        setErrorMessage(''); // Fehler zurücksetzen
        console.log('🔐 Login erfolgreich!');
        navigate('/dashboard');
      } else {
        setErrorMessage('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      }
    } catch (error) {
      setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      console.error('Login fehlgeschlagen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden flex items-center">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/10 to-blue-500/20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,165,0,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(138,43,226,0.1) 0%, transparent 50%),
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '400px 400px, 400px 400px, 50px 50px, 50px 50px',
            animation: 'backgroundMove 20s linear infinite'
          }}
        />
        <style jsx>{`
          @keyframes backgroundMove {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(50px, 50px) rotate(360deg); }
          }
        `}</style>
      </div>

      <Particles />

      {/* Main Container - Side by Side Layout */}
      <div className="relative z-10 w-full h-full flex">

        {/* Left Side - Branding & Metrics (60% width) */}
        <div className="w-3/5 h-full flex flex-col justify-center px-12 relative">
          {/* Parallax Background Elements */}
          <div
            className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-full blur-3xl"
            style={{
              transform: `translate(${(mousePosition.x - 50) * 0.3}px, ${(mousePosition.y - 50) * 0.3}px)`
            }}
          />

          {/* Enhanced Logo & Brand - BIGGER */}
          <div className="flex items-center gap-6 mb-12 group cursor-pointer">
            <div className="relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:shadow-orange-500/50">
                <Brain className="text-white transition-transform duration-500 group-hover:scale-125" size={48} />
              </div>
              <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              {/* Added pulse ring */}
              <div className="absolute -inset-1 border-2 border-orange-400/30 rounded-3xl animate-pulse" />
            </div>
            <div className="transition-transform duration-300 group-hover:translate-x-3">
              <h1 className="text-6xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300 tracking-tight">
                Prometheus
              </h1>
              <p className="text-2xl text-orange-400 font-semibold tracking-wide group-hover:text-orange-300 transition-colors duration-300">
                Marketing Engine
              </p>
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">System Online</span>
              </div>
            </div>
          </div>

          {/* Animated Headline */}
          <div className="mb-8">
            <div className="h-20 flex items-center">
              <h2 className="text-5xl lg:text-6xl font-bold text-white hover:text-orange-400 transition-colors duration-500 cursor-default">
                {typedText}
                <span className="animate-pulse text-orange-500">|</span>
              </h2>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg hover:text-white transition-colors duration-300 cursor-default">
              Die intelligente Marketing-Plattform für <span className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">maximale Performance</span>.
              Steigern Sie Ihre ROAS mit AI-gestützten Insights.
            </p>
          </div>

          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const isActive = index === currentMetric;

              return (
                <div
                  key={metric.label}
                  className={`
                    group p-6 rounded-2xl backdrop-blur-sm border cursor-pointer transition-all duration-700 transform
                    hover:scale-110 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden
                    ${isActive 
                      ? 'bg-white/10 border-orange-500/50 scale-105 shadow-xl shadow-orange-500/20' 
                      : 'bg-white/5 border-gray-700 hover:bg-white/15 hover:border-orange-500/30'
                    }
                  `}
                  onMouseEnter={() => setCurrentMetric(index)}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gray-800/50 group-hover:bg-white/10 transition-colors duration-300">
                        <Icon
                          className={`${metric.color} transition-all duration-500 ${isActive || 'group-hover:' ? 'animate-bounce' : ''} group-hover:scale-125`}
                          size={24}
                        />
                      </div>
                      <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-300">
                        {metric.label}
                      </span>
                    </div>
                    <div className={`text-3xl font-bold mb-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
                      {metric.description}
                    </div>
                    <div className="text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                      {metric.trend}
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${metric.bgColor} blur-xl`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Features List */}
          <div className="grid grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <Icon className={`${feature.color} group-hover:scale-125 transition-transform duration-300`} size={18} />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors duration-300 font-medium">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Login Form (40% width) */}
        <div className="w-2/5 h-full flex items-center justify-center px-8 relative">
          {/* Login Form Glow Background */}
          <div
            className="absolute inset-y-20 inset-x-4 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-3xl blur-3xl opacity-50"
            style={{
              transform: `translate(${(mousePosition.x - 50) * 0.2}px, ${(mousePosition.y - 50) * 0.2}px)`
            }}
          />

          <div className="w-full max-w-md relative">
            {/* Enhanced Glass morphism card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl backdrop-blur-xl transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-white/15 group-hover:to-white/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 rounded-3xl transition-opacity duration-500 group-hover:opacity-150" />
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

              <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-orange-500/20">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-2 hover:text-orange-400 transition-colors duration-300 cursor-default">Welcome Back</h3>
                  <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">Sign in to access your marketing dashboard</p>
                </div>

                {/* Enhanced Dev Login Button */}
                <button
                  onClick={handleDevLogin}
                  disabled={isLoading}
                  className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Rocket size={20} className="group-hover:animate-pulse" />
                      Quick Dev Login
                      <MousePointer size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800/50 text-gray-400 hover:text-gray-300 transition-colors duration-300">or continue with email</span>
                  </div>
                </div>

                {/* Enhanced Login Form */}
                <div className="space-y-6">
                  {errorMessage && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4">
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  )}
                  {/* Email Field */}
                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors duration-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-orange-400 transition-colors duration-300" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/70 hover:border-orange-500/50 focus:scale-105"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors duration-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-orange-400 transition-colors duration-300" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-11 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/70 hover:border-orange-500/50 focus:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-125"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors duration-300 group">
                      <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 transition-all duration-300 group-hover:scale-110" />
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-orange-400 hover:text-orange-300 transition-all duration-300 hover:scale-105 hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  {/* Enhanced Login Button */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Shield size={18} className="group-hover:animate-pulse" />
                        Sign In to Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                    Don't have an account?{' '}
                    <button className="text-orange-400 hover:text-orange-300 font-semibold transition-all duration-300 hover:scale-105 hover:underline">
                      Start your free trial →
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced bottom gradient glow */}
      <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 transform translate-x-1/2 w-96 h-96 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default ModernLoginPage;