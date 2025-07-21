"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquareIcon,
  UserIcon,
  SchoolIcon,
  LoaderIcon,
} from "lucide-react";

type FilterType = "all" | "unread" | "starred" | "archived";

export default function MessagesTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [userType, setUserType] = useState<"coach" | "player" | "auto">("auto");

  // Form states for different endpoints
  const [conversationFilters, setConversationFilters] = useState({
    search: "",
    filter: "all" as FilterType,
    limit: 50,
  });

  const [conversationId, setConversationId] = useState("");

  const [sendMessageData, setSendMessageData] = useState({
    conversationId: "",
    playerId: "",
    coachId: "",
    content: "Hello! This is a test message from the developer test page.",
  });

  const [bulkMessageData, setBulkMessageData] = useState({
    playerIds: "",
    content: "Hello! This is a bulk test message from the developer test page.",
  });

  const [markReadData, setMarkReadData] = useState({
    conversationId: "",
    messageIds: "",
  });

  const [starData, setStarData] = useState({
    conversationId: "",
  });

  const [playerFilters, setPlayerFilters] = useState({
    search: "",
    gameId: "",
    limit: 50,
  });

  const [coachFilters, setCoachFilters] = useState({
    search: "",
    limit: 50,
  });

  // tRPC hooks
  const utils = api.useUtils();

  // Mutations
  const sendMessageMutation = api.messages.sendMessage.useMutation();
  const sendPlayerMessageMutation =
    api.messages.sendPlayerMessage.useMutation();
  const sendBulkMessageMutation = api.messages.sendBulkMessage.useMutation();
  const markAsReadMutation = api.messages.markAsRead.useMutation();
  const markPlayerAsReadMutation =
    api.messages.markPlayerMessagesAsRead.useMutation();
  const toggleStarMutation = api.messages.toggleStar.useMutation();
  const togglePlayerStarMutation = api.messages.togglePlayerStar.useMutation();

  const handleTest = async (
    testName: string,
    testFn: () => Promise<unknown>,
  ) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    setErrors((prev) => ({ ...prev, [testName]: null }));

    try {
      const result = await testFn();
      setResults((prev) => ({ ...prev, [testName]: result }));
    } catch (error: unknown) {
      setErrors((prev) => ({ ...prev, [testName]: error }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Coach Endpoint Tests
  const testGetConversations = () => {
    return handleTest("getConversations", async () => {
      const result =
        await utils.messages.getConversations.fetch(conversationFilters);
      return result;
    });
  };

  const testGetConversation = () => {
    return handleTest("getConversation", async () => {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }
      const result = await utils.messages.getConversation.fetch({
        conversationId,
      });
      return result;
    });
  };

  const testSendMessage = () => {
    return handleTest("sendMessage", async () => {
      if (!sendMessageData.content) {
        throw new Error("Message content is required");
      }
      if (!sendMessageData.conversationId && !sendMessageData.playerId) {
        throw new Error("Either conversation ID or player ID is required");
      }

      const data: {
        content: string;
        conversationId?: string;
        playerId?: string;
      } = { content: sendMessageData.content };
      if (sendMessageData.conversationId) {
        data.conversationId = sendMessageData.conversationId;
      }
      if (sendMessageData.playerId) {
        data.playerId = sendMessageData.playerId;
      }

      const result = await sendMessageMutation.mutateAsync(data);
      return result;
    });
  };

  const testSendBulkMessage = () => {
    return handleTest("sendBulkMessage", async () => {
      if (!bulkMessageData.content || !bulkMessageData.playerIds) {
        throw new Error("Content and player IDs are required");
      }

      const playerIds = bulkMessageData.playerIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      if (playerIds.length === 0) {
        throw new Error("At least one player ID is required");
      }

      const result = await sendBulkMessageMutation.mutateAsync({
        playerIds,
        content: bulkMessageData.content,
      });
      return result;
    });
  };

  const testMarkAsRead = () => {
    return handleTest("markAsRead", async () => {
      if (!markReadData.conversationId) {
        throw new Error("Conversation ID is required");
      }

      const data: { conversationId: string; messageIds?: string[] } = {
        conversationId: markReadData.conversationId,
      };
      if (markReadData.messageIds) {
        data.messageIds = markReadData.messageIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      }

      const result = await markAsReadMutation.mutateAsync(data);
      return result;
    });
  };

  const testToggleStar = () => {
    return handleTest("toggleStar", async () => {
      if (!starData.conversationId) {
        throw new Error("Conversation ID is required");
      }
      const result = await toggleStarMutation.mutateAsync({
        conversationId: starData.conversationId,
      });
      return result;
    });
  };

  const testGetAvailablePlayers = () => {
    return handleTest("getAvailablePlayers", async () => {
      const filters = {
        ...playerFilters,
        search: playerFilters.search || undefined,
        gameId: playerFilters.gameId || undefined,
      };
      const result = await utils.messages.getAvailablePlayers.fetch(filters);
      return result;
    });
  };

  // Player Endpoint Tests
  const testGetPlayerConversations = () => {
    return handleTest("getPlayerConversations", async () => {
      const result =
        await utils.messages.getPlayerConversations.fetch(conversationFilters);
      return result;
    });
  };

  const testGetPlayerConversation = () => {
    return handleTest("getPlayerConversation", async () => {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }
      const result = await utils.messages.getPlayerConversation.fetch({
        conversationId,
      });
      return result;
    });
  };

  const testSendPlayerMessage = () => {
    return handleTest("sendPlayerMessage", async () => {
      if (!sendMessageData.content) {
        throw new Error("Message content is required");
      }
      if (!sendMessageData.conversationId && !sendMessageData.coachId) {
        throw new Error("Either conversation ID or coach ID is required");
      }

      const data: {
        content: string;
        conversationId?: string;
        coachId?: string;
      } = { content: sendMessageData.content };
      if (sendMessageData.conversationId) {
        data.conversationId = sendMessageData.conversationId;
      }
      if (sendMessageData.coachId) {
        data.coachId = sendMessageData.coachId;
      }

      const result = await sendPlayerMessageMutation.mutateAsync(data);
      return result;
    });
  };

  const testMarkPlayerAsRead = () => {
    return handleTest("markPlayerAsRead", async () => {
      if (!markReadData.conversationId) {
        throw new Error("Conversation ID is required");
      }

      const data: { conversationId: string; messageIds?: string[] } = {
        conversationId: markReadData.conversationId,
      };
      if (markReadData.messageIds) {
        data.messageIds = markReadData.messageIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      }

      const result = await markPlayerAsReadMutation.mutateAsync(data);
      return result;
    });
  };

  const testTogglePlayerStar = () => {
    return handleTest("togglePlayerStar", async () => {
      if (!starData.conversationId) {
        throw new Error("Conversation ID is required");
      }
      const result = await togglePlayerStarMutation.mutateAsync({
        conversationId: starData.conversationId,
      });
      return result;
    });
  };

  const testGetAvailableCoaches = () => {
    return handleTest("getAvailableCoaches", async () => {
      const filters = {
        ...coachFilters,
        search: coachFilters.search || undefined,
      };
      const result = await utils.messages.getAvailableCoaches.fetch(filters);
      return result;
    });
  };

  const clearResults = () => {
    setResults({});
    setErrors({});
  };

  const renderResult = (testName: string) => {
    const result = results[testName];
    const error = errors[testName];
    const isLoading = loading[testName];

    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <p className="font-medium text-red-800">Error:</p>
          <pre className="mt-1 text-sm whitespace-pre-wrap text-red-600">
            {error instanceof Error
              ? error.message
              : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }

    if (result) {
      return (
        <div className="rounded border border-green-200 bg-green-50 p-3">
          <p className="font-medium text-green-800">Success:</p>
          <pre className="mt-1 max-h-40 overflow-y-auto text-sm whitespace-pre-wrap text-green-600">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 flex items-center justify-center space-x-2 text-3xl font-bold text-white">
          <MessageSquareIcon className="h-8 w-8 text-blue-500" />
          <span>Messages tRPC Test Page</span>
        </h1>
        <p className="text-gray-400">
          Test all messages router endpoints for both coaches and players
        </p>
        {user && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-blue-600">
              Logged in as: {user.emailAddresses[0]?.emailAddress}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Label htmlFor="userType">Test as:</Label>
              <Select
                value={userType}
                onValueChange={(value: "coach" | "player" | "auto") =>
                  setUserType(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {!user && (
          <p className="mt-2 text-sm text-red-600">
            Not logged in - you need to authenticate to test these endpoints
          </p>
        )}
      </div>

      <div className="mb-6 flex justify-center gap-4">
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Coach Endpoints */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <UserIcon className="h-5 w-5 text-green-500" />
              <span>Coach Endpoints</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test coach-specific messaging functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Get Conversations */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Conversations</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search players..."
                    value={conversationFilters.search}
                    onChange={(e) =>
                      setConversationFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="filter">Filter</Label>
                  <Select
                    value={conversationFilters.filter}
                    onValueChange={(value: FilterType) =>
                      setConversationFilters((prev) => ({
                        ...prev,
                        filter: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="starred">Starred</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={testGetConversations}
                disabled={loading.getConversations}
                className="w-full"
              >
                {loading.getConversations
                  ? "Loading..."
                  : "Test Get Conversations"}
              </Button>
              {renderResult("getConversations")}
            </div>

            {/* Get Conversation */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Conversation Details</h4>
              <div>
                <Label htmlFor="conversationId">Conversation ID</Label>
                <Input
                  id="conversationId"
                  placeholder="Enter conversation ID..."
                  value={conversationId}
                  onChange={(e) => setConversationId(e.target.value)}
                />
              </div>
              <Button
                onClick={testGetConversation}
                disabled={loading.getConversation}
                className="w-full"
              >
                {loading.getConversation
                  ? "Loading..."
                  : "Test Get Conversation"}
              </Button>
              {renderResult("getConversation")}
            </div>

            {/* Send Message */}
            <div className="space-y-3">
              <h4 className="font-medium">Send Message</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="sendConversationId">Conversation ID</Label>
                  <Input
                    id="sendConversationId"
                    placeholder="For existing conversation..."
                    value={sendMessageData.conversationId}
                    onChange={(e) =>
                      setSendMessageData((prev) => ({
                        ...prev,
                        conversationId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="playerId">Player ID</Label>
                  <Input
                    id="playerId"
                    placeholder="For new conversation..."
                    value={sendMessageData.playerId}
                    onChange={(e) =>
                      setSendMessageData((prev) => ({
                        ...prev,
                        playerId: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="messageContent">Message Content</Label>
                <Textarea
                  id="messageContent"
                  placeholder="Enter your message..."
                  value={sendMessageData.content}
                  onChange={(e) =>
                    setSendMessageData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={testSendMessage}
                disabled={loading.sendMessage}
                className="w-full"
              >
                {loading.sendMessage ? "Sending..." : "Test Send Message"}
              </Button>
              {renderResult("sendMessage")}
            </div>

            {/* Send Bulk Message */}
            <div className="space-y-3">
              <h4 className="font-medium">Send Bulk Message</h4>
              <div>
                <Label htmlFor="playerIds">Player IDs (comma-separated)</Label>
                <Input
                  id="playerIds"
                  placeholder="player1-id, player2-id, ..."
                  value={bulkMessageData.playerIds}
                  onChange={(e) =>
                    setBulkMessageData((prev) => ({
                      ...prev,
                      playerIds: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="bulkContent">Message Content</Label>
                <Textarea
                  id="bulkContent"
                  placeholder="Enter your bulk message..."
                  value={bulkMessageData.content}
                  onChange={(e) =>
                    setBulkMessageData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={testSendBulkMessage}
                disabled={loading.sendBulkMessage}
                className="w-full"
              >
                {loading.sendBulkMessage
                  ? "Sending..."
                  : "Test Send Bulk Message"}
              </Button>
              {renderResult("sendBulkMessage")}
            </div>

            {/* Get Available Players */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Available Players</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="playerSearch">Search</Label>
                  <Input
                    id="playerSearch"
                    placeholder="Search players..."
                    value={playerFilters.search}
                    onChange={(e) =>
                      setPlayerFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gameId">Game ID</Label>
                  <Input
                    id="gameId"
                    placeholder="Filter by game..."
                    value={playerFilters.gameId}
                    onChange={(e) =>
                      setPlayerFilters((prev) => ({
                        ...prev,
                        gameId: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={testGetAvailablePlayers}
                disabled={loading.getAvailablePlayers}
                className="w-full"
              >
                {loading.getAvailablePlayers
                  ? "Loading..."
                  : "Test Get Available Players"}
              </Button>
              {renderResult("getAvailablePlayers")}
            </div>
          </CardContent>
        </Card>

        {/* Player Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SchoolIcon className="h-5 w-5" />
              <span>Player Endpoints</span>
            </CardTitle>
            <CardDescription>
              Test player-specific messaging functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Get Player Conversations */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Player Conversations</h4>
              <Button
                onClick={testGetPlayerConversations}
                disabled={loading.getPlayerConversations}
                className="w-full"
              >
                {loading.getPlayerConversations
                  ? "Loading..."
                  : "Test Get Player Conversations"}
              </Button>
              {renderResult("getPlayerConversations")}
            </div>

            {/* Get Player Conversation */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Player Conversation Details</h4>
              <Button
                onClick={testGetPlayerConversation}
                disabled={loading.getPlayerConversation}
                className="w-full"
              >
                {loading.getPlayerConversation
                  ? "Loading..."
                  : "Test Get Player Conversation"}
              </Button>
              {renderResult("getPlayerConversation")}
            </div>

            {/* Send Player Message */}
            <div className="space-y-3">
              <h4 className="font-medium">Send Player Message</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="playerConversationId">Conversation ID</Label>
                  <Input
                    id="playerConversationId"
                    placeholder="For existing conversation..."
                    value={sendMessageData.conversationId}
                    onChange={(e) =>
                      setSendMessageData((prev) => ({
                        ...prev,
                        conversationId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="coachId">Coach ID</Label>
                  <Input
                    id="coachId"
                    placeholder="For new conversation..."
                    value={sendMessageData.coachId}
                    onChange={(e) =>
                      setSendMessageData((prev) => ({
                        ...prev,
                        coachId: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={testSendPlayerMessage}
                disabled={loading.sendPlayerMessage}
                className="w-full"
              >
                {loading.sendPlayerMessage
                  ? "Sending..."
                  : "Test Send Player Message"}
              </Button>
              {renderResult("sendPlayerMessage")}
            </div>

            {/* Get Available Coaches */}
            <div className="space-y-3">
              <h4 className="font-medium">Get Available Coaches</h4>
              <div>
                <Label htmlFor="coachSearch">Search</Label>
                <Input
                  id="coachSearch"
                  placeholder="Search coaches..."
                  value={coachFilters.search}
                  onChange={(e) =>
                    setCoachFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                onClick={testGetAvailableCoaches}
                disabled={loading.getAvailableCoaches}
                className="w-full"
              >
                {loading.getAvailableCoaches
                  ? "Loading..."
                  : "Test Get Available Coaches"}
              </Button>
              {renderResult("getAvailableCoaches")}
            </div>

            {/* Mark Player Messages as Read */}
            <div className="space-y-3">
              <h4 className="font-medium">Mark Player Messages as Read</h4>
              <div>
                <Label htmlFor="markReadConversationId">Conversation ID</Label>
                <Input
                  id="markReadConversationId"
                  placeholder="Enter conversation ID..."
                  value={markReadData.conversationId}
                  onChange={(e) =>
                    setMarkReadData((prev) => ({
                      ...prev,
                      conversationId: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="messageIds">
                  Message IDs (optional, comma-separated)
                </Label>
                <Input
                  id="messageIds"
                  placeholder="msg1-id, msg2-id, ... (leave empty for all)"
                  value={markReadData.messageIds}
                  onChange={(e) =>
                    setMarkReadData((prev) => ({
                      ...prev,
                      messageIds: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                onClick={testMarkPlayerAsRead}
                disabled={loading.markPlayerAsRead}
                className="w-full"
              >
                {loading.markPlayerAsRead
                  ? "Marking..."
                  : "Test Mark Player Messages as Read"}
              </Button>
              {renderResult("markPlayerAsRead")}
            </div>

            {/* Toggle Player Star */}
            <div className="space-y-3">
              <h4 className="font-medium">Toggle Player Star</h4>
              <div>
                <Label htmlFor="starConversationId">Conversation ID</Label>
                <Input
                  id="starConversationId"
                  placeholder="Enter conversation ID..."
                  value={starData.conversationId}
                  onChange={(e) =>
                    setStarData((prev) => ({
                      ...prev,
                      conversationId: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                onClick={testTogglePlayerStar}
                disabled={loading.togglePlayerStar}
                className="w-full"
              >
                {loading.togglePlayerStar
                  ? "Toggling..."
                  : "Test Toggle Player Star"}
              </Button>
              {renderResult("togglePlayerStar")}
            </div>
          </CardContent>
        </Card>

        {/* Shared Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shared Actions</CardTitle>
            <CardDescription>
              Actions that work for both coaches and players
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mark as Read */}
            <div className="space-y-3">
              <h4 className="font-medium">Mark Messages as Read (Coach)</h4>
              <Button
                onClick={testMarkAsRead}
                disabled={loading.markAsRead}
                className="w-full"
              >
                {loading.markAsRead
                  ? "Marking..."
                  : "Test Mark as Read (Coach)"}
              </Button>
              {renderResult("markAsRead")}
            </div>

            {/* Toggle Star */}
            <div className="space-y-3">
              <h4 className="font-medium">Toggle Star (Coach)</h4>
              <Button
                onClick={testToggleStar}
                disabled={loading.toggleStar}
                className="w-full"
              >
                {loading.toggleStar
                  ? "Toggling..."
                  : "Test Toggle Star (Coach)"}
              </Button>
              {renderResult("toggleStar")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600">Security Notes:</h4>
              <ul className="list-inside list-disc space-y-1 text-gray-600">
                <li>All endpoints require proper authentication via Clerk</li>
                <li>Coach endpoints only work when logged in as a coach</li>
                <li>Player endpoints only work when logged in as a player</li>
                <li>Users can only access their own conversations and data</li>
                <li>
                  No security is undermined - all authorization checks are
                  maintained
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600">Testing Tips:</h4>
              <ul className="list-inside list-disc space-y-1 text-gray-600">
                <li>
                  Use &quot;Get Available Players/Coaches&quot; to find valid
                  IDs for testing
                </li>
                <li>
                  Test both existing conversation flows and new conversation
                  creation
                </li>
                <li>
                  Try different filter combinations for conversation lists
                </li>
                <li>Test bulk messaging with multiple player IDs</li>
                <li>Verify read status and starring functionality</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-600">
                Current Limitations:
              </h4>
              <ul className="list-inside list-disc space-y-1 text-gray-600">
                <li>Backend currently returns mock data for most endpoints</li>
                <li>Real database integration needed for full functionality</li>
                <li>
                  Message history and conversation persistence not yet
                  implemented
                </li>
                <li>Real-time updates require WebSocket implementation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
