import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_k7uVICgJw8fs@ep-summer-art-ad8f5ek0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const MAX_FREE = 3;
const APP_NAME = 'alertlens';

export async function checkAndIncrementUsage(ip: string): Promise<{ allowed: boolean; count: number; remaining: number }> {
  try {
    const result = await pool.query(`
      INSERT INTO usage_tracking (ip_address, app_name, usage_count, last_used)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (ip_address, app_name)
      DO UPDATE SET usage_count = usage_tracking.usage_count + 1, last_used = NOW()
      RETURNING usage_count
    `, [ip, APP_NAME]);

    const count = result.rows[0].usage_count;
    return {
      allowed: count <= MAX_FREE,
      count,
      remaining: Math.max(0, MAX_FREE - count),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, count: 0, remaining: MAX_FREE };
  }
}

export async function markUserAuthenticated(ip: string, uid: string, email: string): Promise<void> {
  try {
    await pool.query(`
      UPDATE usage_tracking
      SET firebase_uid = $3, email = $4
      WHERE ip_address = $1 AND app_name = $2
    `, [ip, APP_NAME, uid, email]);
  } catch (error) {
    console.error('Mark auth failed:', error);
  }
}

export async function isAuthenticated(ip: string): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT firebase_uid FROM usage_tracking
      WHERE ip_address = $1 AND app_name = $2 AND firebase_uid IS NOT NULL
      LIMIT 1
    `, [ip, APP_NAME]);
    return result.rows.length > 0;
  } catch {
    return false;
  }
}
