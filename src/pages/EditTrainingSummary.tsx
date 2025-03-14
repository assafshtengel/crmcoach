
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EditTrainingSummary() {
  const { trainingSummaryId } = useParams<{ trainingSummaryId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">עריכת סיכום אימון</h1>
        <p className="text-gray-500">טופס לעריכת סיכום אימון ID: {trainingSummaryId}</p>
      </div>
    </Layout>
  );
}
