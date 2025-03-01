
import React from 'react';
import { Layout } from "@/components/layout/Layout";
import { ToolsList } from "@/components/tools/ToolsList";

export default function ToolManagement() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">ניהול כלים</h1>
        <ToolsList />
      </div>
    </Layout>
  );
}
