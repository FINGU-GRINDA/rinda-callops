'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Phone, 
  Bot, 
  Zap, 
  Globe, 
  Star, 
  Play, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Clock, 
  Shield,
  Sparkles,
  PhoneCall,
  MessageSquare,
  BarChart3,
  Mic,
  Brain,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: e.clientX, 
        y: e.clientY 
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "RINDA AI Agent",
      description: "Understands natural conversation in multiple languages and dialects, but more importantly, knows how to act on what it hears.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Visual Workflow Builder",
      description: "Set up 'receive order → check inventory → process payment → send to kitchen' in 10 minutes without writing code.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Action Engine",
      description: "Pre-built connectors to 100+ business tools (Sheets, Square, KakaoTalk) that execute automatically based on conversation outcomes.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Complete Automation Loop",
      description: "From initial call through post-call actions to proactive outbound engagement—the first true AI employee platform.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { value: "1.2M+", label: "Actions Completed", subtext: "This month alone" },
    { value: "340%", label: "Revenue Increase", subtext: "Average customer" },
    { value: "100+", label: "Business Tools", subtext: "Pre-built connectors" },
    { value: "10min", label: "Setup Time", subtext: "No coding required" }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Owner",
      company: "Bella Vista Restaurant",
      avatar: "MS",
      content: "RINDA doesn't just take orders—it updates our POS, notifies the kitchen, and sends pickup reminders. We've eliminated 90% of no-shows.",
      rating: 5
    },
    {
      name: "Dr. James Kim",
      role: "Practice Manager",
      company: "MedCenter Clinic",
      avatar: "JK", 
      content: "When patients call for appointments, RINDA books them, sends confirmations, and calls the day before. It's like having a perfect receptionist that never sleeps.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Operations Director",
      company: "QuickFix Services",
      avatar: "LT",
      content: "Set up our 'call → schedule → confirm → follow-up' workflow in 8 minutes. Our booking efficiency increased 500% overnight.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Gradient Mesh */}
        <div 
          className="absolute w-[800px] h-[800px] opacity-30"
          style={{
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)`,
            left: mousePosition.x - 400,
            top: mousePosition.y - 400,
            transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
            transition: 'all 0.3s ease-out'
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate3d(0, ${scrollY * 0.2}px, 0)`
          }}
        />
        
        {/* Ambient Orbs */}
        <div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
          style={{ transform: `translate3d(0, ${scrollY * -0.3}px, 0) rotate(${scrollY * 0.1}deg)` }}
        />
        <div 
          className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl"
          style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0) rotate(${scrollY * -0.05}deg)` }}
        />
      </div>

      {/* Advanced Navigation */}
      <nav className="relative z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                RINDA CallOps
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white group">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                AI Phone-to-Action Platform
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                AI Employees That
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Complete The Work
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                While other tools just handle calls, RINDA creates AI employees that answer calls AND automatically complete the work—from taking orders to scheduling follow-ups—with drag-and-drop simplicity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Start Free Trial</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                  </Button>
                </Link>
                
                <Button 
                  size="lg" 
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 px-8 py-4 text-lg group backdrop-blur-md"
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  No coding required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  10-min setup
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  100+ integrations
                </div>
              </div>
            </div>

            {/* Right Content - Product Preview */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Main Dashboard Preview */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-gray-400 text-sm ml-2">CallOps Dashboard</span>
                  </div>
                  
                  {/* Live Workflow Simulation */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mb-4 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-medium">Action Engine - Restaurant Order</span>
                    </div>
                    <div className="text-white text-sm mb-2">
                      "I'd like to order 2 margherita pizzas for pickup at 7pm"
                    </div>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Order processed → Kitchen notified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Payment confirmed → Receipt sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-yellow-400 rounded-full animate-spin"></div>
                        <span>SMS reminder scheduled for 6:45pm</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-blue-400 font-bold">127</div>
                      <div className="text-gray-400 text-xs">Actions/Day</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-green-400 font-bold">8</div>
                      <div className="text-gray-400 text-xs">AI Employees</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-purple-400 font-bold">42h</div>
                      <div className="text-gray-400 text-xs">Time Saved</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg animate-bounce">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Bento Grid */}
      <section ref={statsRef} className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Beyond Call Handling—Complete Automation
            </h2>
            <p className="text-gray-400 text-lg">
              While others require manual triggers or need developers, RINDA creates autonomous workflows
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`transition-all duration-1000 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 text-center group hover:border-blue-500/30 transition-all duration-300">
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 font-medium mb-1">{stat.label}</div>
                  <div className="text-gray-500 text-sm">{stat.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Bento */}
      <section id="features" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              The First True AI Employee Platform
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              While other tools help developers build voice apps, RINDA lets any business owner create AI employees that complete the work with drag-and-drop simplicity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`transition-all duration-1000 delay-${index * 150} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-8 group hover:border-gray-600/50 transition-all duration-500 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real Businesses, Real Results
            </h2>
            <p className="text-gray-400 text-lg">
              See how RINDA creates autonomous workflows for different industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/40 p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-medium">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl border border-gray-700/40 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready for AI Employees That Actually Work?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join 500+ business owners who've created autonomous workflows that handle everything from order-to-delivery to appointment-to-follow-up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Start Free Trial</span>
                    <ArrowRight className="ml-2 w-5 h-5 relative transform transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 px-8 py-4 text-lg backdrop-blur-md"
                >
                  Schedule Demo
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                No credit card required • 14-day free trial • 10-minute setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}