
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function NewTrainingSummary() {
  const { playerId } = useParams<{ playerId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">סיכום אימון חדש</h1>
        <p className="text-gray-500">טופס ליצירת סיכום אימון חדש עבור שחקן ID: {playerId}</p>
      </div>
    </Layout>
  );
}
