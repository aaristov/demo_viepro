import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Activity, User2, Brain, Trophy, Timer } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green to-dark-green">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="mb-8">
            <img 
              src="/api/placeholder/200/80" 
              alt="One Life+ Logo" 
              className="h-20"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4">
            ONE LIFE+
          </h1>
          <p className="text-xl md:text-2xl text-blue-800 max-w-2xl">
            Real-time global health audit powered by AI
          </p>
        </div>
      </section>

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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Start Your 14-Day Free Trial
          </h2>
          <p className="text-lg text-blue-800 mb-8">
            Join thousands of healthcare professionals already using ONE LIFE+
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <p>&copy; 2025 ONE LIFE+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;