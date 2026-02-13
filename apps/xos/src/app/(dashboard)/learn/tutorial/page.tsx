import Link from "next/link";
import { tutorialOrder, getTopic, type LearnTopic } from "@/content/learn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorialNav } from "./tutorial-nav";

export default function TutorialPage() {
  const ordered: LearnTopic[] = tutorialOrder
    .map((slug) => getTopic(slug))
    .filter((t): t is LearnTopic => t != null);
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Back to Learn
        </Link>
        <h1 className="text-2xl font-bold mt-2">xOS tutorial</h1>
        <p className="text-muted-foreground mt-1">
          Follow the steps below. Use “Next” to move through; open a topic for the full article.
        </p>
      </div>

      {ordered.map((topic, index) => (
        <Card key={topic.slug} id={topic.slug}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Step {index + 1}: {topic.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topic.sections.map((section, i) => (
              <div key={i}>
                <h3 className="font-medium text-sm text-foreground mb-2">{section.heading}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {section.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-3">
              <Link
                href={`/learn/${topic.slug}`}
                className="text-sm text-primary hover:underline"
              >
                Read full article →
              </Link>
              {topic.slug === "getting-started" && (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Try: Open Dashboard
                </Link>
              )}
              {topic.slug === "commitments" && (
                <Link
                  href="/commitments"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Try: Commitments
                </Link>
              )}
              {topic.slug === "decisions" && (
                <Link
                  href="/decisions"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Try: Decisions
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <TutorialNav topics={ordered} />
    </div>
  );
}
