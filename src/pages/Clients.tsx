
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Clients = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Clients</h1>
        <Card>
          <CardHeader>
            <CardTitle>Clients Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Client management functionality will be implemented soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
