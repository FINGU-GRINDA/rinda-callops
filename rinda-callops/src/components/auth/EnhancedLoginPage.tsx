'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, ArrowRight, Sparkles, Bot, Users } from 'lucide-react';
import Link from 'next/link';

export default function EnhancedLoginPage() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    try {
      await signUp(email, password, displayName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Ambient Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-3xl font-bold mb-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              RINDA CallOps
            </span>
          </Link>
          <p className="text-gray-300 text-lg">
            AI Phone Agents for Your Business
          </p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-gray-700/50">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-300">
                    Sign in to manage your AI phone agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">Create Account</CardTitle>
                  <CardDescription className="text-gray-300">
                    Get started with your AI phone agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Business Name</Label>
                    <Input
                      id="signup-name"
                      name="displayName"
                      type="text"
                      placeholder="Your Business"
                      required
                      className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Accounts Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold">Demo Accounts</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Email:</span>
              <span className="font-mono">demo@rindacallops.com</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Password:</span>
              <span className="font-mono">demo123</span>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Use these credentials to explore the platform with sample data
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-xl border border-gray-700/30 p-4 text-center hover:border-gray-600/50 transition-all duration-300">
            <Bot className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">AI Agents</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-xl border border-gray-700/30 p-4 text-center hover:border-gray-600/50 transition-all duration-300">
            <Phone className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">Voice Calls</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-xl border border-gray-700/30 p-4 text-center hover:border-gray-600/50 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}