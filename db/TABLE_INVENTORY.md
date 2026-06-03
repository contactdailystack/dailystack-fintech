# TABLE INVENTORY

ไฟล์นี้เก็บบันทึกตารางและสถานะ schema ของฐานข้อมูล (public schema)

เทมเพลตการบันทึก (CSV friendly)

| table_name | columns (name:type) | primary_key | indexes | approximate_row_count | last_altered | notes |
|------------|---------------------|-------------|---------|-----------------------|--------------|-------|

คำสั่งที่ใช้ตรวจสอบตารางและ schema

- รายชื่อทุกตาราง (public schema):
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

- รายละเอียดคอลัมน์ของตาราง `your_table`:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'your_table'
ORDER BY ordinal_position;
```

- จำนวนแถวโดยประมาณ (pg_stat_user_tables):
```sql
SELECT relname AS table_name, n_live_tup AS approx_row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

- สร้าง script DROP statements (ดูผลก่อนรัน):
```sql
SELECT 'DROP TABLE IF EXISTS public.' || quote_ident(tablename) || ' CASCADE;' AS ddl
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

- หรือสั่งรันอัตโนมัติ (ระวัง: จะลบทุกตารางใน public schema):
```sql
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

หมายเหตุสำคัญ:
- ให้สำรองข้อมูล (pg_dump หรือ Supabase Backups) ก่อนรันคำสั่ง DROP ใดๆ
- หากมี foreign keys, views, หรือ functions ที่พึ่งพาตารางเหล่านี้ การลบแบบ CASCADE จะลบ dependencies ด้วย
- หากระบบใช้ schema อื่นที่ไม่ใช่ `public` ให้ปรับ `schemaname` ตามจริง

บันทึกสถานะหลังการลบ: ให้แก้ตารางด้านบนเพื่อบันทึกว่าได้ลบตารางใดบ้าง และใครเป็นผู้ดำเนินการ พร้อม timestamp
