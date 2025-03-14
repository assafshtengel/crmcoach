
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EditGameSummary() {
  const { gameSummaryId } = useParams<{ gameSummaryId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">עריכת סיכום משחק</h1>
        <p className="text-gray-500">טופס לעריכת סיכום משחק ID: {gameSummaryId}</p>
      </div>
    </Layout>
  );
}
