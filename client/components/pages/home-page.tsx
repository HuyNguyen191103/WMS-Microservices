"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Package, Send, Truck, Warehouse } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/api/product-api";
import { listWarehouses } from "@/lib/api/warehouse-api";

export function HomePage() {
  return (
    <AppShell>
      {() => <HomeContent />}
    </AppShell>
  );
}

function HomeContent() {
  const [summary, setSummary] = useState({
    products: 0,
    warehouses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      await Promise.resolve();

      try {
        const [products, warehouses] = await Promise.all([
          listProducts(),
          listWarehouses(),
        ]);

        setSummary({
          products: products.length,
          warehouses: warehouses.length,
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadSummary();
  }, []);

  const cards = [
    {
      title: "Products",
      value: summary.products,
      href: "/products",
      icon: Package,
      description: "Catalog records available for warehouse operations.",
    },
    {
      title: "Warehouses",
      value: summary.warehouses,
      href: "/warehouses",
      icon: Warehouse,
      description: "Storage facilities currently registered in the system.",
    },
    {
      title: "Inbound",
      value: "Soon",
      href: "/inbound",
      icon: Truck,
      description: "Receiving workflows will be connected when APIs are ready.",
    },
    {
      title: "Outbound",
      value: "Soon",
      href: "/outbound",
      icon: Send,
      description: "Fulfillment workflows will be connected when APIs are ready.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Home"
        description="Monitor warehouse management data, move into daily workflows, and keep high-impact actions close at hand."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                  <div className="rounded-md bg-slate-100 p-2 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-950">
                  {isLoading ? "..." : card.value}
                </p>
                <Button asChild variant="ghost" className="mt-4 px-0">
                  <Link href={card.href}>
                    Open {card.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Daily workflow</CardTitle>
            <CardDescription>
              The operational pages are ready for product and warehouse control.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Product maintenance", "/products"],
              ["Warehouse setup", "/warehouses"],
              ["Inbound operations", "/inbound"],
              ["Outbound operations", "/outbound"],
            ].map(([label, href]) => (
              <Button key={href} asChild variant="outline" className="justify-between">
                <Link href={href}>
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access model</CardTitle>
            <CardDescription>
              Actions are hidden when the signed-in role cannot perform them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Product creation is available to all operational roles.</p>
            <p>Product and warehouse write actions are reserved for managers and above.</p>
            <p>Activity logs are visible only to administrators and directors.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
