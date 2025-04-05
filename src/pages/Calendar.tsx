
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle>Calendar Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Calendar functionality will be implemented soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
