import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout, Palette, Download, FolderOpen, Users, Zap, BarChart3, PieChart, GanttChart, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import sampleSales from '@assets/sample-sales-dashboard.png';
import sampleMarketing from '@assets/sample-marketing-dashboard.png';
import sampleGantt from '@assets/sample-gantt-chart.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Slide Designer Pro</span>
          </div>
          <Button asChild data-testid="button-login-header">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground mb-6">
                  <Zap className="w-3 h-3 text-primary" />
                  Free to use
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                  Create Professional<br />
                  <span className="text-primary">KPI Slides</span> in Minutes
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Design stunning presentations with drag-and-drop simplicity. Build KPI dashboards,
                  Gantt charts, sales pipelines, and data visualizations — no design skills needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" asChild data-testid="button-get-started">
                    <a href="/api/login">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  No credit card required
                </p>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative">
                  <div className="rounded-lg border border-border shadow-lg overflow-hidden bg-card">
                    <img
                      src={sampleSales}
                      alt="Sales KPI dashboard example"
                      className="w-full h-auto"
                      data-testid="img-hero-dashboard"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-48 rounded-lg border border-border shadow-lg overflow-hidden bg-card rotate-[-3deg]">
                    <img
                      src={sampleMarketing}
                      alt="Marketing dashboard example"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-showcase-title">See What You Can Build</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                From sales dashboards to project timelines — create presentation-ready slides for any department.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group">
                <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm mb-3 transition-shadow group-hover:shadow-md">
                  <img src={sampleSales} alt="Sales Overview template" className="w-full h-auto" data-testid="img-sample-sales" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Sales Overview</h3>
                </div>
                <p className="text-xs text-muted-foreground">Revenue metrics, deal pipeline, win rates, and performance charts.</p>
              </div>

              <div className="group">
                <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm mb-3 transition-shadow group-hover:shadow-md">
                  <img src={sampleMarketing} alt="Marketing Dashboard template" className="w-full h-auto" data-testid="img-sample-marketing" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Marketing Dashboard</h3>
                </div>
                <p className="text-xs text-muted-foreground">Conversion funnels, lead metrics, campaign ROI, and channel breakdown.</p>
              </div>

              <div className="group">
                <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm mb-3 transition-shadow group-hover:shadow-md">
                  <img src={sampleGantt} alt="Campaign Planning template" className="w-full h-auto" data-testid="img-sample-gantt" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <GanttChart className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Campaign Planning</h3>
                </div>
                <p className="text-xs text-muted-foreground">Gantt charts, event timelines, and project tracking across phases.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Everything You Need</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Powerful features wrapped in a simple, intuitive interface.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pre-built Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Start with professionally designed templates for sales, marketing, events, and project planning.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Drag & Drop Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive block-based editor with grid snapping for pixel-perfect layouts every time.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Export Anywhere</h3>
                <p className="text-sm text-muted-foreground">
                  Export your slides as high-resolution PNG images or save projects as JSON for later.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Save your projects to the cloud and access them from anywhere, on any device.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">User Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with Google, GitHub, or Apple to keep your work safe and synced.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">10+ Block Types</h3>
                <p className="text-sm text-muted-foreground">
                  KPI stats, pie charts, bar charts, Gantt charts, tables, funnels, pipelines, and more.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Create your first slide in under a minute. No design skills required.
            </p>
            <Button size="lg" asChild data-testid="button-signup-cta">
              <a href="/api/login">
                Start Designing
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 px-4" data-testid="landing-footer">
        <div className="container mx-auto flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span>&copy; 2026 Krykk Ltd. All rights reserved. Slide Designer Pro is a trademark of Krykk Ltd.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/terms" className="hover:underline hover:text-foreground transition-colors" data-testid="link-terms">Terms & Conditions</Link>
            <span className="text-border">|</span>
            <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</Link>
            <span className="text-border">|</span>
            <Link href="/contact" className="hover:underline hover:text-foreground transition-colors" data-testid="link-contact">Contact us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
