import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Shield, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from '@/components/header'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight">About RestoreAI</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-[600px] mx-auto text-center">
              Bringing your precious memories back to life with cutting-edge artificial intelligence technology.
            </p>
          </div>

          <Separator />

          {/* Mission Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At RestoreAI, we believe that every photograph tells a story worth preserving. Our mission is to make
              professional-grade image restoration accessible to everyone, using the power of artificial intelligence to
              breathe new life into old, damaged, or low-quality photos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether it's a cherished family portrait from decades past, a historical document, or a blurry snapshot
              that holds sentimental value, our AI-powered restoration technology can help you rediscover the clarity
              and beauty that time may have obscured.
            </p>
          </section>

          {/* Features Grid */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Why Choose RestoreAI?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Lightning Fast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our advanced AI models process your images in seconds, not hours. Get professional results without
                    the wait.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your photos are processed securely and are never stored on our servers. Your memories remain private
                    and safe.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Utilizing state-of-the-art machine learning models trained on millions of images to deliver
                    exceptional restoration quality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User-Friendly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No technical expertise required. Simply upload your image and let our AI do the rest. It's that
                    simple.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technology Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">The Technology Behind RestoreAI</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                RestoreAI leverages advanced deep learning models specifically designed for image enhancement and
                restoration. Our AI has been trained on vast datasets of high-quality images to understand the intricate
                patterns and details that make photos look natural and crisp.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The restoration process involves multiple AI techniques including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Super-resolution algorithms to enhance image clarity and detail</li>
                <li>Noise reduction to remove grain and artifacts</li>
                <li>Color correction and enhancement for vibrant, natural-looking results</li>
                <li>Damage repair to fix scratches, tears, and missing portions</li>
                <li>Sharpening and contrast optimization for improved visual impact</li>
              </ul>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Perfect For</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Family Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Restore old family portraits and preserve precious memories for future generations.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Historical Images</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance historical photographs and documents for research or archival purposes.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Professional Work</h3>
                <p className="text-sm text-muted-foreground">
                  Improve image quality for professional presentations, publications, or portfolios.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Social Media</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance photos before sharing on social platforms for maximum visual impact.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Art & Design</h3>
                <p className="text-sm text-muted-foreground">
                  Restore artwork or improve reference images for creative projects.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Personal Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for scrapbooking, photo albums, or any personal creative endeavor.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Ready to Restore Your Images?</h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Experience the power of AI-driven image restoration. Upload your photo and see the magic happen in
              seconds.
            </p>
            <Link href="/">
              <Button size="lg" className="mt-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Restoring Now
              </Button>
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:h-16 items-center md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RestoreAI. All rights reserved.
          </p>
          <div className="flex items-center md:h-16">
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <a
                href="https://replicate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Replicate
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
