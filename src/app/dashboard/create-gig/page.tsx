'use client';

import { useCreateGig } from '@/hooks/useGigs';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

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
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create gig', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Post a New Gig
        </h1>
        <p className="max-w-2xl text-sm mt-2 text-gray-500 dark:text-gray-400">
          Describe the freelance service you need. Be as precise as possible!
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Gig Title</label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="e.g., Build a modern responsive landing page"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Video">Video / Animation</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Budget (USD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white"
                  placeholder="500"
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white"
              placeholder="Describe requirements, timelines, and exactly what you need built..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={createGig.isPending}
            className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex justify-center items-center transition-colors disabled:opacity-50"
          >
            {createGig.isPending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
            Publish Gig
          </button>
        </form>
      </div>
    </div>
  );
}
