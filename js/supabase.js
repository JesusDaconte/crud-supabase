// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://casfhutobqtkjmrqczuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhc2ZodXRvYnF0a2ptcnFjenV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjU3MzgsImV4cCI6MjA2Nzc0MTczOH0.VvcRSavxbadoTmBIz8uKYAkWzWr6WgoGHCLHyOYS7Qc'

export const supabase = createClient(supabaseUrl, supabaseKey)