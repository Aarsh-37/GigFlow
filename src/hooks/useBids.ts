import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type Bid = {
  id: string;
  gig_id: string;
  freelancer_id: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  freelancer?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
};

export function useGigDetails(gigId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['gig', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select('*, client:users(id, full_name, avatar_url)')
        .eq('id', gigId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!gigId,
  });
}

export function useGigBids(gigId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['bids', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*, freelancer:users(id, full_name, avatar_url)')
        .eq('gig_id', gigId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!gigId,
  });
}

export function useSubmitBid() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gigId, price, message }: { gigId: string; price: number; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bids')
        .insert([{ gig_id: gigId, price, message, freelancer_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bids', variables.gigId] });
    },
  });
}

export function useHireFreelancer() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gigId, bidId, clientId }: { gigId: string; bidId: string; clientId: string }) => {
      const { data, error } = await supabase.rpc('hire_freelancer', {
        p_gig_id: gigId,
        p_bid_id: bidId,
        p_client_id: clientId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig', variables.gigId] });
      queryClient.invalidateQueries({ queryKey: ['bids', variables.gigId] });
    },
  });
}
