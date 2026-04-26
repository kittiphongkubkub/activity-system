import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Bell, 
  Calendar, 
  Info, 
  Award, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Settings
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { NotificationList } from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <NotificationList initialNotifications={notifications as any} />
  );
}
