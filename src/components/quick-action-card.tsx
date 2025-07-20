'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

type QuickActionCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  gradient?: string;
  onClick: () => void;
};

export const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  color,
  gradient,
  onClick,
}: QuickActionCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card
      className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden group"
      onClick={onClick}
    >
      <div
        className={`bg-gradient-to-br ${gradient || 'from-gray-50 to-gray-100'} p-6 h-full`}
      >
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300`}
          >
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-slate-800 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);
