"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  AlertTriangle,
  Database,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminSettings() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-gray-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400">
            View admin information and system settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Admin Info */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Current Admin</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your admin account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="space-y-2">
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-white">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">User ID</Label>
                  <p className="font-mono text-sm text-gray-400">{user.id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <div>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400"
                    >
                      Admin Active
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Admin Management</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage admin roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-blue-200">
                    Admin roles are managed through the Clerk Dashboard. To
                    grant or revoke admin privileges, update the user&apos;s
                    privateMetadata with role: &quot;admin&quot;.
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open("https://dashboard.clerk.com", "_blank")
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Clerk Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Database className="h-5 w-5 text-yellow-500" />
              <span>System Information</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <Label className="text-gray-300">Environment</Label>
                <p className="text-white">
                  {process.env.NODE_ENV || "development"}
                </p>
              </div>
              <div>
                <Label className="text-gray-300">Admin Routes Protected</Label>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400"
                >
                  Active
                </Badge>
              </div>
              <div>
                <Label className="text-gray-300">Middleware Protection</Label>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400"
                >
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Security Notice</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Important security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                • Admin privileges are checked server-side using privateMetadata
              </p>
              <p>• All admin routes are protected by middleware</p>
              <p>• Test routes are only accessible to admin users</p>
              <p>• Admin status is verified on every protected request</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
