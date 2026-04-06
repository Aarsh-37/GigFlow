import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type Gig = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: 'Development' | 'Design' | 'Writing' | 'Marketing' | 'Video' | 'Other';
  status: 'open' | 'in_progress' | 'completed';
  client_id: string;
  created_at: string;
};

export function useAllOpenGigs() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['gigs', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          client:users(id, full_name, avatar_url)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateGig() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGig: Omit<Gig, 'id' | 'created_at' | 'client_id' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('gigs')
        .insert([
          {
            ...newGig,
            client_id: user.id,
            status: 'open',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    },
  });
}
