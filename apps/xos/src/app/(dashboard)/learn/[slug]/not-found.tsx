import Link from "next/link";

export default function LearnTopicNotFound() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">Topic not found</h1>
      <p className="text-muted-foreground text-sm">
        This learning topic doesn’t exist. Check the spelling or go back to the Learn hub.
      </p>
      <Link href="/learn" className="text-sm text-primary hover:underline">
        Back to Learn
      </Link>
    </div>
  );
}
