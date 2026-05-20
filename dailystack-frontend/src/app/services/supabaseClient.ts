import { createClient } from '@supabase/supabase-js';

// เปลี่ยนค่าในเครื่องหมายคำพูดเป็นค่าที่ได้จากหน้าแดชบอร์ด Supabase ของคุณพีคครับ
const supabaseUrl = 'https://kmflgrxtfsiryqwdggpc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZmxncnh0ZnNpcnlxd2RnZ3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzc0NjcsImV4cCI6MjA5MzkxMzQ2N30.EhblfTNtB87Ha--njSFKqyjle75N6e2UJMV39MeGBzo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);