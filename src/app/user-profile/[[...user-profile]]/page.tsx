import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <UserProfile />
    </div>
  );
}
