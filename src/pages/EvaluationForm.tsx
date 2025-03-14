
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EvaluationForm() {
  const { playerId } = useParams<{ playerId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">טופס הערכת שחקן</h1>
        <p className="text-gray-500">טופס להערכת שחקן ID: {playerId}</p>
      </div>
    </Layout>
  );
}
