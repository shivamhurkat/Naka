import type { UserRole } from "@/types/database";

interface RoleGateProps {
  role: UserRole;
  allow: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGate({
  role,
  allow,
  children,
  fallback = null,
}: RoleGateProps) {
  if (!allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
