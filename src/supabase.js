import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://wbobxyjcxbskenntbygx.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indib2J4eWpjeGJza2VubnRieWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzY2NTQsImV4cCI6MjA2ODExMjY1NH0.0VM11EyNKZmmGXSiTOvNnGmSxvzTqvslLSfuqBTJUBA'
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 