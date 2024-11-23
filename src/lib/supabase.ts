import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsconlwlattlvxllnyfn.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zY29ubHdsYXR0bHZ4bGxueWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNjQyMDAsImV4cCI6MjA0NzY0MDIwMH0.nUyu7sredvBDBEZuAh7XqazsM6ERwd5FMop6MQygnB8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
