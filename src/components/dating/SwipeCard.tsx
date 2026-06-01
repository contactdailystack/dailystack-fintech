/**
 * DailyStack — SwipeCard Component
 * Phase 3: Scalable Architecture
 * 
 * Premium card component with:
 * - 3D perspective transforms
 * - Touch gesture support
 * - Swipe physics (spring animation)
 * - Like/Pass overlay indicators
 * - Photo gallery with dots
 * - Profile info overlay
 */

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Heart, X, Star, Flame, MapPin, Clock, Sparkles } from 'lucide-react';

export interface SwipeCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    bio: string;
    distance: string;
    compatibility: number;
    photos: string[];
    interests: string[];
    verified: boolean;
    lastActive: string;
  };
  onSwipe: (direction: 'left' | 'right' | 'up', duration: number) => void;
  isFirst: boolean;
  swipeThreshold?: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  profile, 
  onSwipe, 
  isFirst,
  swipeThreshold = 120 
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  
  const isDragging = useMotionValue(0);
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = swipeThreshold;
    
    if (info.offset.x > threshold) {
      // Swipe right - Like
      onSwipe('right', info.offset.x);
    } else if (info.offset.x < -threshold) {
      // Swipe left - Pass
      onSwipe('left', Math.abs(info.offset.x));
    } else if (info.offset.y < -threshold) {
      // Swipe up - Superlike
      onSwipe('up', Math.abs(info.offset.y));
    }
  };
  
  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };
  
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < profile.photos.length - 1 ? prev + 1 : 0
    );
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : profile.photos.length - 1
    );
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag={isFirst ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={isFirst ? handleDragEnd : undefined}
      whileTap={{ scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
    >
      {/* Card Container */}
      <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#18181B] shadow-2xl">
        
        {/* Photo Container */}
        <div 
          className="relative w-full h-full"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const halfWidth = rect.width / 2;
            
            if (clickX < halfWidth) {
              prevPhoto();
            } else {
              nextPhoto();
            }
          }}
        >
          {/* Photo */}
          <div className="relative w-full h-full">
            <img
              src={profile.photos[currentPhotoIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Photo Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Photo Navigation Dots */}
            <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
              {profile.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPhoto(index);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentPhotoIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
            
            {/* Like Overlay (appears on right drag) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: useTransform(x, [0, 100], [0, 1]),
              }}
            >
              <div className="px-8 py-4 border-4 border-[#D9FD82] rounded-2xl rotate-[-20deg]">
                <span className="text-5xl font-black text-[#D9FD82]">LIKE</span>
              </div>
            </motion.div>
            
            {/* Pass Overlay (appears on left drag) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: useTransform(x, [-100, 0], [1, 0]),
              }}
            >
              <div className="px-8 py-4 border-4 border-red-500 rounded-2xl rotate-[20deg]">
                <span className="text-5xl font-black text-red-500">NOPE</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          {/* Name + Verified Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-white">
              {profile.name}, <span>{profile.age}</span>
            </h2>
            {profile.verified && (
              <div className="w-7 h-7 rounded-full bg-[#D9FD82] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Distance + Last Active */}
          <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.distance} away</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Active {profile.lastActive}</span>
            </div>
          </div>
          
          {/* Bio */}
          <p className="text-white/90 text-sm mb-4 line-clamp-2">{profile.bio}</p>
          
          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 4).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        {/* Compatibility Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full">
            <Sparkles className="w-4 h-4 text-[#D9FD82]" />
            <span className="text-white font-bold text-sm">{profile.compatibility}%</span>
          </div>
        </div>
        
        {/* Flame Badge (for high compatibility) */}
        {profile.compatibility >= 90 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#D9FD82] to-[#B8E860] rounded-full">
              <Flame className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-xs">Top Match</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeCard;