import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlaceholderPageProps = {
  title: string;
  description?: string;
  body?: string;
};

export function PlaceholderPage({ title, description, body }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {body && <CardContent className="text-sm text-muted-foreground">{body}</CardContent>}
      </Card>
    </div>
  );
}
