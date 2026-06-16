"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ComingSoonPageProps = {
  title: string;
  description: string;
};

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <>
      <PageHeader eyebrow="Operations" title={title} description={description} />
      <Card>
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle className="mt-4">Coming soon</CardTitle>
          <CardDescription>
            This workflow is reserved for the next API integration phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/home">
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
