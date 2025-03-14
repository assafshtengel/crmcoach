
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EvaluationDetails() {
  const { evaluationId } = useParams<{ evaluationId: string }>();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">פרטי הערכה</h1>
        <p className="text-gray-500">מציג פרטי הערכה ID: {evaluationId}</p>
      </div>
    </Layout>
  );
}
