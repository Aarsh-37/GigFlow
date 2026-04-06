-- GigFlow Supabase Schema & RPC

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define categories enum
CREATE TYPE gig_category AS ENUM ('Development', 'Design', 'Writing', 'Marketing', 'Video', 'Other');

-- Define gig status enum
CREATE TYPE gig_status AS ENUM ('open', 'in_progress', 'completed');

-- Define bid status enum
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- 1. Users Table (inherits base from auth.users via trigger, or maps directly)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
-- Optionally allow public read of basic user profiles for avatars/names
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);


-- 2. Gigs Table
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  category gig_category NOT NULL DEFAULT 'Other',
  status gig_status NOT NULL DEFAULT 'open',
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for gigs
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gigs are viewable by everyone" ON public.gigs
  FOR SELECT USING (true);
CREATE POLICY "Clients can insert their own gigs" ON public.gigs
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own gigs" ON public.gigs
  FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete their own gigs" ON public.gigs
  FOR DELETE USING (auth.uid() = client_id);


-- 3. Bids Table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  message TEXT NOT NULL,
  status bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent multiple active bids from the same user for the same gig
  UNIQUE(gig_id, freelancer_id)
);

-- Enable RLS for bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Freelancers can view their own bids. Clients can view bids on their gigs.
CREATE POLICY "Users can view their own bids or bids on their gigs" ON public.bids
  FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT client_id FROM public.gigs WHERE id = gig_id)
  );
CREATE POLICY "Freelancers can insert their own bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update their own bids" ON public.bids
  FOR UPDATE USING (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can delete their own bids" ON public.bids
  FOR DELETE USING (auth.uid() = freelancer_id);


-- 4. Conversations Table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gig_id, client_id, freelancer_id)
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id);


-- 5. Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT client_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT freelancer_id FROM public.conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Participants can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT client_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT freelancer_id FROM public.conversations WHERE id = conversation_id
    )
  );


-- 6. hire_freelancer RPC function
CREATE OR REPLACE FUNCTION public.hire_freelancer(
  p_gig_id UUID,
  p_bid_id UUID,
  p_client_id UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_gig_status gig_status;
  v_gig_client_id UUID;
  v_freelancer_id UUID;
BEGIN
  -- Validate gig ownership and current status
  SELECT status, client_id INTO v_gig_status, v_gig_client_id
  FROM public.gigs
  WHERE id = p_gig_id
  FOR UPDATE; -- Lock gig row to prevent race conditions

  IF v_gig_client_id != p_client_id THEN
    RAISE EXCEPTION 'Not authorized to hire for this gig';
  END IF;

  IF v_gig_status != 'open' THEN
    RAISE EXCEPTION 'Gig is no longer open for hiring';
  END IF;

  -- Get the freelancer ID from the bid
  SELECT freelancer_id INTO v_freelancer_id
  FROM public.bids
  WHERE id = p_bid_id AND gig_id = p_gig_id;

  IF v_freelancer_id IS NULL THEN
    RAISE EXCEPTION 'Invalid bid or bid does not belong to this gig';
  END IF;

  -- Accept the selected bid
  UPDATE public.bids
  SET status = 'accepted'
  WHERE id = p_bid_id;

  -- Reject all other bids for this gig
  UPDATE public.bids
  SET status = 'rejected'
  WHERE id != p_bid_id AND gig_id = p_gig_id;

  -- Update the gig status
  UPDATE public.gigs
  SET status = 'in_progress'
  WHERE id = p_gig_id;

  -- Create a conversation between the client and the hired freelancer
  INSERT INTO public.conversations (gig_id, client_id, freelancer_id)
  VALUES (p_gig_id, p_client_id, v_freelancer_id)
  ON CONFLICT DO NOTHING; -- Ensure idempotency if conversation already exists somehow

END;
$$;


-- 7. Trigger to automatically create a user record on signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gigs;

