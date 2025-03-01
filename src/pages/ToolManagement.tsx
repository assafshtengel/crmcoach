
import React from 'react';
import { Sidebar } from "@/components/ui/sidebar";
import { ToolsList } from "@/components/tools/ToolsList";
import { Layout } from "@/components/layout/Layout";

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
