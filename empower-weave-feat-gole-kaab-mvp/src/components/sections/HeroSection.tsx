import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Upload, BarChart3 } from 'lucide-react';
import heroImage from '@/assets/hero-unity.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Community Unity"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
              Empowering
              <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Communities
              </span>
              Together
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              A platform designed for marginalized communities - youth, women, and people with disabilities.
              Share your voice, access resources, and build connections that matter.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <Upload className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold text-primary-foreground">Share Resources</h3>
              <p className="text-sm text-primary-foreground/80 text-center">Upload documents, reports, and images</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <BarChart3 className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold text-primary-foreground">Data Insights</h3>
              <p className="text-sm text-primary-foreground/80 text-center">Visualize impact and track progress</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
              <Users className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold text-primary-foreground">Community</h3>
              <p className="text-sm text-primary-foreground/80 text-center">Connect and engage with others</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6 shadow-warm"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
            >
              Learn More
            </Button>
          </div>

          {/* Accessibility Notice */}
          <div className="mt-8 p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-primary-foreground/20">
            <p className="text-primary-foreground/90 text-sm">
              <span className="font-semibold">Accessible by Design:</span> This platform is built with accessibility in mind,
              supporting screen readers, keyboard navigation, and high contrast modes.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};