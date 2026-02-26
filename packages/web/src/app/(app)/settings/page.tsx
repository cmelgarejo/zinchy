"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderKeyForm } from "@/components/provider-key-form";
import { SettingsUsers } from "@/components/settings-users";
import { SettingsProfile } from "@/components/settings-profile";

interface ProviderStatus {
  defaultProvider: string | null;
  providers: Record<string, { configured: boolean }>;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/providers");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin, fetchStatus]);

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue={isAdmin ? "provider" : "profile"}>
        <TabsList>
          {isAdmin && <TabsTrigger value="provider">Provider</TabsTrigger>}
          {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="provider">
            <Card>
              <CardHeader>
                <CardTitle>LLM Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ProviderKeyForm
                    onSuccess={fetchStatus}
                    submitLabel="Save"
                    configuredProviders={status?.providers}
                    defaultProvider={status?.defaultProvider}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users">
            <SettingsUsers currentUserId={session?.user?.id ?? ""} />
          </TabsContent>
        )}

        <TabsContent value="profile">
          <SettingsProfile userName={session?.user?.name ?? ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
