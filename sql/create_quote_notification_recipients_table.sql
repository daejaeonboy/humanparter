CREATE TABLE IF NOT EXISTS public.quote_notification_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.quote_notification_recipients (email, is_active)
VALUES ('hm_solution@naver.com', true)
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.quote_notification_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quote_notification_recipients_read" ON public.quote_notification_recipients;
CREATE POLICY "quote_notification_recipients_read"
ON public.quote_notification_recipients
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "quote_notification_recipients_insert" ON public.quote_notification_recipients;
CREATE POLICY "quote_notification_recipients_insert"
ON public.quote_notification_recipients
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "quote_notification_recipients_update" ON public.quote_notification_recipients;
CREATE POLICY "quote_notification_recipients_update"
ON public.quote_notification_recipients
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "quote_notification_recipients_delete" ON public.quote_notification_recipients;
CREATE POLICY "quote_notification_recipients_delete"
ON public.quote_notification_recipients
FOR DELETE
USING (true);
