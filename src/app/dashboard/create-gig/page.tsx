'use client';

import { useCreateGig } from '@/hooks/useGigs';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, DollarSign, ListFilter, Briefcase } from 'lucide-react';
import Link from 'next/link';

const gigSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (min 20 chars)'),
  budget: z.number().min(5, 'Minimum budget is $5'),
  category: z.enum(['Development', 'Design', 'Writing', 'Marketing', 'Video', 'Other']),
});

type GigForm = z.infer<typeof gigSchema>;

export default function CreateGigPage() {
  const router = useRouter();
  const createGig = useCreateGig();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GigForm>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      category: 'Development',
    },
  });

  const onSubmit = async (data: GigForm) => {
    try {
      await createGig.mutateAsync(data);
      router.push('/dashboard/explore');
    } catch (error) {
      console.error('Failed to create gig', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      
      {/* Header Section */}
      <div className="mb-10">
        <Link href="/dashboard" className="text-[#1A62FF] font-bold text-[10px] tracking-widest uppercase mb-4 block hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-[1.1]">
          Post a new <span className="text-[#1A62FF]">opportunity.</span>
        </h1>
        <p className="max-w-xl text-[15px] font-medium text-gray-500 mt-4 leading-relaxed">
          Describe the freelance service you need. Our network of vetted professionals will review and submit their proposals.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">
              <Briefcase className="h-4 w-4 text-[#1A62FF]" /> Gig Title
            </label>
            <input
              {...register('title')}
              className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-[#F8FAFD] text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium"
              placeholder="e.g., Build a modern responsive landing page"
            />
            {errors.title && <p className="mt-2 text-xs font-bold text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Select */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">
                <ListFilter className="h-4 w-4 text-[#1A62FF]" /> Category
              </label>
              <select
                {...register('category')}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-[#F8FAFD] text-gray-900 focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Video">Video / Animation</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-2 text-xs font-bold text-red-500">{errors.category.message}</p>}
            </div>

            {/* Budget Input */}
            <div>
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">
                <DollarSign className="h-4 w-4 text-[#1A62FF]" /> Budget Setup
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-5 font-extrabold text-[#1A62FF]">$</div>
                <input
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-9 pr-5 py-4 border border-gray-200 rounded-xl bg-[#F8FAFD] text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-bold"
                  placeholder="500"
                />
              </div>
              {errors.budget && <p className="mt-2 text-xs font-bold text-red-500">{errors.budget.message}</p>}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3 uppercase tracking-wider">
              Project Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-[#F8FAFD] text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium resize-none"
              placeholder="Describe requirements, timelines, and exactly what you need built..."
            />
            {errors.description && <p className="mt-2 text-xs font-bold text-red-500">{errors.description.message}</p>}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
             <button
              type="submit"
              disabled={createGig.isPending}
              className="bg-[#1A62FF] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-[0_4px_14px_rgba(26,98,255,0.3)] hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createGig.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {createGig.isPending ? 'Publishing...' : 'Publish Gig to Network'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
