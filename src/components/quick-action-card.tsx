import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type QuickActionCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
};

export const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: QuickActionCardProps) => (
  <Card
    className="hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="p-4 text-left">
      <Icon className={`mb-2 h-6 w-6 ${color}`} />
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </CardContent>
  </Card>
);
