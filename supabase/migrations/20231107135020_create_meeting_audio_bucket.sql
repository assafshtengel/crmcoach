
-- Create storage bucket for meeting summary audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting_summaries_audio', 'Meeting Summaries Audio', true);

-- Create policy to allow authenticated users to upload audio files
CREATE POLICY "Allow authenticated users to upload meeting audio" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'meeting_summaries_audio');

-- Create policy to allow public to read meeting audio files
CREATE POLICY "Allow public to read meeting audio" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'meeting_summaries_audio');
