CREATE TABLE public.donor_qna_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donor_qna_threads TO authenticated;
GRANT ALL ON public.donor_qna_threads TO service_role;
ALTER TABLE public.donor_qna_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage their own Q&A threads" ON public.donor_qna_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX donor_qna_threads_user_updated_idx ON public.donor_qna_threads (user_id, updated_at DESC);

CREATE TABLE public.donor_qna_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.donor_qna_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.donor_qna_messages TO authenticated;
GRANT ALL ON public.donor_qna_messages TO service_role;
ALTER TABLE public.donor_qna_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can read their own Q&A messages" ON public.donor_qna_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Donors can submit their own questions" ON public.donor_qna_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'user');
CREATE POLICY "Donors can delete their own Q&A messages" ON public.donor_qna_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX donor_qna_messages_thread_created_idx ON public.donor_qna_messages (thread_id, created_at);