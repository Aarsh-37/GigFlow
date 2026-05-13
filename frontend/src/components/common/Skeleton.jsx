import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
            {...props}
        />
    );
};

export const GigSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="h-32 bg-indigo-600 animate-pulse" />
            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6">
                    <Skeleton className="h-32 w-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg" />
                </div>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
        </div>
    </div>
);

export default Skeleton;
