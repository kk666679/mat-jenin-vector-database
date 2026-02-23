import Link from "next/link";
import {
  MessageCircleIcon,
  DatabaseIcon,
  BrainIcon,
  LayersIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
  points: string[];
};

const features: Feature[] = [
  {
    title: "Vector Storage",
    description:
      "Store and index high-dimensional vectors for semantic search.",
    icon: DatabaseIcon,
    points: [
      "HNSW indexing",
      "Multi-tenant isolation",
      "Automatic embeddings",
    ],
  },
  {
    title: "AI Retrieval",
    description:
      "Hybrid search with re-ranking and context optimization.",
    icon: BrainIcon,
    points: [
      "Semantic similarity",
      "Keyword + vector",
      "Smart re-ranking",
    ],
  },
  {
    title: "Document Processing",
    description:
      "Automatic chunking and metadata extraction.",
    icon: LayersIcon,
    points: ["PDF & text support", "Smart chunking", "Metadata extraction"],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <Card className="transition hover:shadow-lg hover:border-primary/40">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {feature.points.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <Badge variant="secondary" className="mb-6 gap-2">
            <SparklesIcon className="w-3 h-3" />
            AI Vector Database
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Smart Search, <span className="text-primary">Enterprise Scale</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Turn Enterprise Data into Intelligence. From scattered repositories to a unified AI-powered knowledge layer, 
            MatJenin helps enterprises search smarter, automate faster, and scale intelligence securely.
          </p>

          <div className="flex justify-center mt-16">
            <div className="relative w-40 h-40"></div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need for AI Search
            </h2>
            <p className="text-muted-foreground">
              Built with modern AI infrastructure components.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Build Smarter AI?
          </h2>

          <Link href="/chat">
            <Button size="lg" className="gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}