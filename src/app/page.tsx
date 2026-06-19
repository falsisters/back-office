"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/ui/spinner";
import { BillCountList } from "@/components/Bills/BillsList";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">
            Falsisters Rice Trading
          </CardTitle>
          <CardDescription className="text-lg">Back Office</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          <h2 className="text-4xl font-semibold text-gray-700">Welcome!</h2>
          <h2 className="text-4xl font-semibold text-gray-700 mb-10">
            {user?.name}
          </h2>
          <div className="flex gap-4 w-full max-w-md">
            <Link href="/products" className="w-full">
              <Button size="lg" variant="default" className="w-full text-white">
                Manage Inventory
              </Button>
            </Link>
            <Link href="/cashiers" className="w-full">
              <Button size="lg" variant="outline" className="w-full">
                Manage Cashiers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Daily Bill Count</h2>
        <BillCountList />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGate requireAuth>
      <DashboardContent />
    </AuthGate>
  );
}
