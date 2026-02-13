import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, getAllSlugs } from "@/content/learn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function LearnTopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Back to Learn
        </Link>
        <h1 className="text-2xl font-bold mt-2">{topic.title}</h1>
        <p className="text-muted-foreground mt-1">{topic.description}</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-8">
          {topic.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
              <div className="space-y-3 text-muted-foreground">
                {section.body.map((para, j) => (
                  <p key={j} className="text-sm">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4 text-sm">
        <Link href="/learn" className="text-primary hover:underline">
          All topics
        </Link>
        <Link href="/learn/tutorial" className="text-muted-foreground hover:underline">
          Tutorial
        </Link>
      </div>
    </div>
  );
}
