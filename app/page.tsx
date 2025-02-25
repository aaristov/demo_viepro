'use client';

import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Activity, User2, Brain, Trophy, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-green via-green to-blue-100">
      {/* Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo-small.svg" alt="ONE LIFE+" className="h-8 mr-2" />
            <span className="text-white text-lg font-semibold">ONE LIFE+</span>
          </Link>
          
          <div>
            {status === 'authenticated' ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:text-blue-100">
                    Dashboard
                  </Button>
                </Link>
                <span className="text-white">|</span>
                <span className="text-white">{session?.user?.name}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-white hover:text-blue-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 mt-4">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="mb-8 relative w-48 h-80">
            <img 
              src="/logo.svg"
              alt="One Life+ Logo"
              className="h-120"
            />
          </div>
          {/* <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4">
            ONE LIFE+
          </h1> */}
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
            Real-time global health audit powered by AI
          </p>
        </div>
      </section>

      {/* Rest of your component remains the same */}
      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Automatic Anamnesis</h3>
              </div>
              <p>Real-time global health audit with comprehensive patient history tracking</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">AI-Medical Assistant</h3>
              </div>
              <p>Smart health assessment and recommendations powered by advanced AI</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Complete Health Overview</h3>
              </div>
              <p>Holistic approach to patient care including physical and mental health</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Benefits for Healthcare Professionals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 rounded-lg p-6">
            <Timer className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Time Saving</h3>
            <p>Save 5 minutes per patient consultation</p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-6">
            <User2 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Overview</h3>
            <p>Get a comprehensive view of patient history</p>
          </div>

          <div className="bg-white/80 rounded-lg p-6">
            <Trophy className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Better Outcomes</h3>
            <p>Reduce medical errors with AI assistance</p>
          </div>

          <div className="bg-white/80 rounded-lg p-6">
            <Activity className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Holistic Care</h3>
            <p>Consider all aspects of patient health</p>
          </div>
        </div>
      </section>

      {/* CTA Section - Only shown for unauthenticated users */}
      {status !== 'authenticated' ? (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Start Your 14-Day Free Trial
            </h2>
            <p className="text-lg text-blue-800 mb-8">
              Join thousands of healthcare professionals already using ONE LIFE+
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signin">
                <Button 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="outline"
                  className="px-8 py-3 rounded-lg text-lg font-semibold"
                >
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Welcome Back, {session?.user?.name || 'Patient'}
            </h2>
            <p className="text-lg text-blue-800 mb-8">
              Continue your health journey with ONE LIFE+
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-blue-100 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-blie-900">
            <p>&copy; 2025 ONE LIFE+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}