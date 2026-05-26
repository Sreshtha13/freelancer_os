import { supabaseAdmin } from '../config/supabase.js';

const REMOTE_OK_URL = 'https://remoteok.com/api';

function normalizeRemoteOkJob(item, userId) {
  return {
    user_id: userId,
    external_id: String(item.id),
    title: item.position || item.title || 'Untitled',
    description: item.description || '',
    source: 'remoteok',
    url: item.url || item.apply_url || `https://remoteok.com/remote-jobs/${item.id}`,
    tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',')) : [],
    budget: item.salary || null,
    company_name: item.company,
    location: item.location,
    is_remote: true,
    posted_date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
    raw_payload: item,
  };
}

async function fetchRemoteOk() {
  const res = await fetch(REMOTE_OK_URL, {
    headers: { 'User-Agent': 'FreelancerOS/1.0 (legal aggregator)' },
  });
  if (!res.ok) throw new Error(`RemoteOK API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.slice(1) : [];
}

async function fetchArbeitnow() {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
    headers: { 'User-Agent': 'FreelancerOS/1.0' },
  });
  if (!res.ok) throw new Error(`Arbeitnow API error: ${res.status}`);
  const json = await res.json();
  return (json.data || []).map((item) => ({
    user_id: null,
    external_id: item.slug,
    title: item.title,
    description: item.description || '',
    source: 'arbeitnow',
    url: item.url,
    tags: item.tags || [],
    budget: null,
    company_name: null,
    location: item.location,
    is_remote: item.remote ?? false,
    posted_date: item.created_at,
    raw_payload: item,
  }));
}

export async function syncJobsForUser(userId) {
  const results = { inserted: 0, skipped: 0, errors: [] };

  try {
    const remoteOkJobs = await fetchRemoteOk();
    for (const item of remoteOkJobs.slice(0, 50)) {
      const row = normalizeRemoteOkJob(item, userId);
      const { error } = await supabaseAdmin.from('jobs').upsert(row, {
        onConflict: 'user_id,url',
        ignoreDuplicates: false,
      });
      if (error) results.skipped++;
      else results.inserted++;
    }
  } catch (e) {
    results.errors.push({ source: 'remoteok', message: e.message });
  }

  try {
    const arbeitJobs = await fetchArbeitnow();
    for (const item of arbeitJobs.slice(0, 50)) {
      const row = { ...item, user_id: userId };
      const { error } = await supabaseAdmin.from('jobs').upsert(row, {
        onConflict: 'user_id,url',
      });
      if (error) results.skipped++;
      else results.inserted++;
    }
  } catch (e) {
    results.errors.push({ source: 'arbeitnow', message: e.message });
  }

  return results;
}

export async function importManualJob(userId, payload) {
  const row = {
    user_id: userId,
    title: payload.title || 'Imported Job',
    description: payload.description || '',
    source: payload.source || 'manual',
    url: payload.url,
    tags: payload.tags || [],
    budget: payload.budget,
    posted_date: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .upsert(row, { onConflict: 'user_id,url' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
