CREATE POLICY "admins manage case media" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'case-media' AND public.has_role(auth.uid(),'admin'))
WITH CHECK (bucket_id = 'case-media' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins read donation proofs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'donation-proofs' AND public.has_role(auth.uid(),'admin'));