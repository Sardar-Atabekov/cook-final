'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Heart,
  Mail,
  Github,
  Twitter,
  Instagram,
  Sparkles,
  Utensils,
  Clock,
} from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const quickLinks = [
    { href: '/recipes', label: t('footer.popularRecipes'), icon: Utensils },
    { href: '/suggested', label: t('footer.suggestedMeals'), icon: Sparkles },
    { href: '/recipes?type=quick', label: t('footer.quickMeals'), icon: Clock },
  ];

  const supportLinks = [
    { href: '#', label: 'Help Center', icon: Mail },
    { href: '#', label: 'Contact Us', icon: Mail },
    { href: '#', label: 'Privacy Policy', icon: Mail },
  ];

  const socialLinks = [
    { href: '#', icon: Github, label: 'GitHub', color: 'hover:text-gray-400' },
    {
      href: '#',
      icon: Twitter,
      label: 'Twitter',
      color: 'hover:text-blue-400',
    },
    {
      href: '#',
      icon: Instagram,
      label: 'Instagram',
      color: 'hover:text-pink-400',
    },
  ];

  return (
    <motion.footer
      data-testid="footer"
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm"
              >
                <ChefHat className="h-8 w-8 text-blue-400" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {t('footer.projectName')}
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              {t('footer.description')}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className={`p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/50 ${social.color}`}
                    whileHover={{ scale: 1.1, y: -3, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 300,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-white mb-6 flex items-center text-lg">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse"></span>
              {t('footer.explore')}
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <Icon className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:text-blue-300 transition-colors duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-white mb-6 flex items-center text-lg">
              <span className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Support
            </h3>
            <ul className="space-y-4">
              {supportLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <Icon className="w-4 h-4 mr-3 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:text-green-300 transition-colors duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-white mb-6 flex items-center text-lg">
              <Mail className="h-5 w-5 mr-3 text-blue-400" />
              Stay Updated
            </h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Get weekly recipe suggestions and cooking tips delivered to your
              inbox.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="space-y-3"
            >
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                <Mail className="h-4 w-4 mr-2" />
                Sign Up for Updates
              </Button>
              <p className="text-xs text-slate-400 text-center">
                No spam, unsubscribe at any time
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-slate-800/50 pt-8 mt-16 text-center"
          variants={itemVariants}
        >
          <p className="text-slate-400 text-sm flex items-center justify-center">
            © 2025 RecipeMatch. All rights reserved. Made with{' '}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mx-2"
            >
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            </motion.span>{' '}
            for food lovers.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
