
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EvaluationsList() {
  const { playerId } = useParams<{ playerId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">רשימת הערכות</h1>
        <p className="text-gray-500">רשימת ההערכות עבור שחקן ID: {playerId}</p>
      </div>
    </Layout>
  );
}
