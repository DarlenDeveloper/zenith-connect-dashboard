
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Activity = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        <Card>
          <CardHeader>
            <CardTitle>Activity Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Activity tracking functionality will be implemented soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Activity;
