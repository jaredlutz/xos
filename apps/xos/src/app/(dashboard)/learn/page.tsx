import Link from "next/link";
import { learnTopics } from "@/content/learn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, List } from "lucide-react";

export default function LearnHubPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Learn xOS</h1>
        <p className="text-muted-foreground mt-1">
          Get up to speed on the Command Center, Hyperfocus mode, commitments, and decisions.
        </p>
      </div>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Start tutorial
          </CardTitle>
          <CardDescription>
            A short walkthrough: CEO mode, dashboard, commitments, decisions, proof, and admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/learn/tutorial"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start tutorial
          </Link>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <List className="h-4 w-4" />
          Browse by topic
        </h2>
        <ul className="space-y-3">
          {learnTopics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <span className="font-medium">{topic.title}</span>
                <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
