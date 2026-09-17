export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const NEON_HOST = 'ep-orange-mountain-aus0z9mc-pooler.c-10.us-east-1.aws.neon.tech';
    const NEON_USER = 'neondb_owner';
    const NEON_DB = 'neondb';

    async function query(sql, params = []) {
      const connString = `postgresql://${NEON_USER}:${encodeURIComponent(env.DATABASE_PASSWORD)}@${NEON_HOST}/${NEON_DB}?sslmode=require`;
      const body = { query: sql };
      if (params.length > 0) body.params = params;
      const res = await fetch('https://' + NEON_HOST + '/sql', {
        method: 'POST',
        headers: {
          'Neon-Connection-String': connString,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error('Neon error ' + res.status + ': ' + text);
      }
      return res.json();
    }

    try {
      // Health check
      if (url.pathname === '/api/health') {
        const data = await query('SELECT 1 as ok');
        return Response.json({ ok: true, data }, { headers: corsHeaders });
      }

      // Créer la table users
      if (url.pathname === '/api/setup' && request.method === 'POST') {
        await query(`CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )`);
        return Response.json({ success: true, message: 'Table users prête' }, { headers: corsHeaders });
      }

      // Créer un utilisateur
      if (url.pathname === '/api/users' && request.method === 'POST') {
        const { email, name, password } = await request.json();
        if (!email || !name || !password)
          return Response.json({ error: 'email, name et password requis' }, { status: 400, headers: corsHeaders });
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const password_hash = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
        try {
          await query('INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)', [email, name, password_hash]);
          return Response.json({ success: true, message: 'Utilisateur créé' }, { headers: corsHeaders });
        } catch (e) {
          return Response.json({ error: 'Email déjà utilisé' }, { status: 409, headers: corsHeaders });
        }
      }

      // Lister les utilisateurs
      if (url.pathname === '/api/users' && request.method === 'GET') {
        const data = await query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
        return Response.json(data.rows || [], { headers: corsHeaders });
      }

      // Détail d'un utilisateur
      const match = url.pathname.match(/^\/api\/users\/(\d+)$/);
      if (match && request.method === 'GET') {
        const data = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [match[1]]);
        const rows = data.rows || [];
        if (rows.length === 0) return Response.json({ error: 'Introuvable' }, { status: 404, headers: corsHeaders });
        return Response.json(rows[0], { headers: corsHeaders });
      }

      return Response.json({ error: 'Route non trouvée' }, { status: 404, headers: corsHeaders });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
    }
  }
};
