'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{
      type: 'spring',
      stiffness: 300,
      damping: 20,
    }}
    className="group"
  >
    <Card
      className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white/90"
      onClick={onClick}
    >
      <div
        className={`bg-gradient-to-br ${gradient || 'from-gray-50 to-gray-100'} p-6 h-full relative overflow-hidden`}
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        <div className="flex items-start space-x-4 relative z-10">
          <motion.div
            className={`p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
            whileHover={{ rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Icon className={`h-7 w-7 ${color}`} />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-slate-800 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {description}
            </p>

            {/* Animated arrow */}
            <motion.div
              className="flex items-center text-blue-600 font-medium text-sm"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="mr-2">Get started</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300" />
        <div className="absolute bottom-2 right-4 w-1 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors duration-300" />
      </div>
    </Card>
  </motion.div>
);
