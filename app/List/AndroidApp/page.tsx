"use client";

import React, { useState, useEffect } from 'react';
import { Play, Download, Star, Zap, Clock, Smartphone } from 'lucide-react';

export default function AnimeStreamLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Play className="w-8 h-8" />, title: "Unlimited Streaming", desc: "Watch thousands of anime series and movies" },
    { icon: <Download className="w-8 h-8" />, title: "Offline Downloads", desc: "Download episodes and watch anywhere" },
    { icon: <Zap className="w-8 h-8" />, title: "Lightning Fast", desc: "HD quality with instant playback" }
  ];

  const animeShows = [
    { title: "Demon Slayer", rating: 9.2, color: "from-red-600 to-red-800" },
    { title: "Attack on Titan", rating: 9.0, color: "from-red-700 to-red-900" },
    { title: "One Piece", rating: 8.9, color: "from-red-500 to-red-700" },
    { title: "Jujutsu Kaisen", rating: 8.8, color: "from-red-800 to-black" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
    

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-sm font-semibold animate-bounce">
            Now Available on Android
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600 leading-tight">
            Your Anime
            <br />
            Universe
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-400 max-w-2xl mx-auto">
            Stream over 10,000+ anime episodes and movies. Watch your favorites anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="https://expo.dev/artifacts/eas/2wZxzDQEXRUXrQjhXCcg4y.apk" className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center space-x-2 shadow-2xl shadow-red-900/50">
              <Smartphone className="w-6 h-6" />
              <span>Download for Android</span>
              <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition"></div>
            </a>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-bold text-lg hover:bg-white/20 transition border border-white/20">
              Watch Trailer
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-red-500">10K+</div>
              <div className="text-gray-500">Episodes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">50+</div>
              <div className="text-gray-500">Genres</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-700">4K</div>
              <div className="text-gray-500">Quality</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-red-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-red-600 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* App Preview Section */}
      <section className="py-20 px-4 relative bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Mobile Mockup */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-72 h-[600px] bg-gradient-to-b from-zinc-900 to-black rounded-[3rem] p-3 shadow-2xl shadow-red-900/30 border-4 border-zinc-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl"></div>
                  
                  {/* Screen Content */}
                  <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-900 to-transparent z-10 flex items-center justify-between px-8 pt-2">
                      <span className="text-xs">9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-white rounded"></div>
                        <div className="w-1 h-3 bg-white rounded"></div>
                        <div className="w-1 h-3 bg-white rounded"></div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="pt-12 px-4">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                        Featured Anime
                      </h3>
                      
                      {/* Featured Card */}
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-red-600 to-red-900">
                        <div className="absolute inset-0 flex items-end p-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                              <span className="text-sm font-bold">9.1</span>
                            </div>
                            <h4 className="font-bold text-lg">Demon Slayer</h4>
                          </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6" fill="white" />
                          </div>
                        </div>
                      </div>

                      {/* Grid of smaller cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-[2/3] rounded-lg bg-gradient-to-br from-red-700 to-black"></div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-8">
                      <Play className="w-5 h-5 text-red-500" />
                      <Download className="w-5 h-5 text-gray-500" />
                      <Star className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-transparent blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                Experience Anime Like Never Before
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Sleek, intuitive interface designed for the ultimate anime streaming experience on Android.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Smooth Playback</h3>
                    <p className="text-gray-400">Optimized video player with adaptive quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Offline Mode</h3>
                    <p className="text-gray-400">Download and watch without internet</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Lightning Fast</h3>
                    <p className="text-gray-400">Instant loading with no buffering</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
            Why Choose AnimeStream?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all duration-300 ${
                  activeFeature === index ? 'scale-105 shadow-2xl shadow-red-900/30 border-red-600' : ''
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Download CTA */}
      <section id="download" className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-950/40 to-black backdrop-blur-sm border border-red-900/30 rounded-3xl p-12">
            <h2 className="text-5xl font-bold mb-6">Ready to Start Watching?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Download AnimeStream now and get 30 days free premium access
            </p>
            <button className="px-12 py-5 bg-gradient-to-r from-red-600 to-red-800 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-red-900/50 flex items-center space-x-3 mx-auto">
              <Smartphone className="w-7 h-7" />
              <a href="https://expo.dev/artifacts/eas/2wZxzDQEXRUXrQjhXCcg4y.apk" className="text-white no-underline">Get Started Free</a>
            </button>
            <p className="mt-4 text-sm text-gray-500">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5" fill="white" />
            </div>
            <span className="text-xl font-bold">AnimeStream</span>
          </div>
          <div className="flex space-x-8 text-gray-500">
            <a href="#" className="hover:text-red-500 transition">Privacy</a>
            <a href="#" className="hover:text-red-500 transition">Terms</a>
            <a href="#" className="hover:text-red-500 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}