import { motion } from "motion/react";

export function SkeletonPulse({ className }: { className: string }) {
  return (
    <motion.div
      className={`bg-editorial-border/60 dark:bg-editorial-border/20 rounded ${className}`}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function PostItemSkeleton() {
  return (
    <div className="mb-[60px] max-w-3xl border-b border-editorial-border pb-[40px] last:border-0">
      {/* Author & Info header */}
      <div className="flex items-center gap-[15px] mb-[20px]">
        <SkeletonPulse className="w-[36px] h-[36px] rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonPulse className="h-3 w-28" />
          <SkeletonPulse className="h-2.5 w-16" />
        </div>
      </div>

      {/* Main post contents */}
      <div className="mb-[20px] space-y-3">
        <SkeletonPulse className="h-8 md:h-10 w-3/4 mb-[15px]" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-11/12" />
        <SkeletonPulse className="h-4 w-4/5" />
      </div>

      {/* Footer tags */}
      <div className="flex items-center gap-[15px]">
        <SkeletonPulse className="h-[26px] w-20 rounded-full" />
        <SkeletonPulse className="h-[26px] w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="p-[40px] max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-[30px]">
        <div className="flex items-center gap-[15px]">
          <SkeletonPulse className="w-[44px] h-[44px] rounded-full shrink-0" />
          <div className="flex flex-col gap-2">
            <SkeletonPulse className="h-4 w-36" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Title block */}
      <div className="space-y-3">
        <SkeletonPulse className="h-10 md:h-14 w-full" />
        <SkeletonPulse className="h-10 md:h-14 w-5/6" />
      </div>

      {/* Cover Image Placeholder */}
      <SkeletonPulse className="w-full h-[320px] md:h-[450px] rounded-lg" />

      {/* Body content lines */}
      <div className="space-y-4">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-11/12" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function FeaturedCarouselSkeleton() {
  return (
    <div className="border border-editorial-border bg-editorial-panel p-6 md:p-8 rounded-lg mb-8 space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-5 h-5 rounded" />
        <SkeletonPulse className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SkeletonPulse className="w-full h-[240px] md:h-[320px] rounded-md" />
        <div className="flex flex-col justify-center space-y-4">
          <SkeletonPulse className="h-[20px] w-24 rounded" />
          <SkeletonPulse className="h-8 md:h-12 w-full" />
          <SkeletonPulse className="h-8 md:h-12 w-3/4" />
          <div className="space-y-2 pt-2">
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-11/12" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <SkeletonPulse className="w-8 h-8 rounded-full" />
            <SkeletonPulse className="h-3.5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
