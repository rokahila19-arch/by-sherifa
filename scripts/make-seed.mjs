// Génère supabase/seed.sql à partir du catalogue embarqué (src/app/data/products.data.ts).
// Usage : node scripts/make-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('src/app/data/products.data.ts', 'utf8');
const products = JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1));

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) => (a ? `array[${a.map(q).join(', ')}]::text[]` : 'null');
const json = (v) => (v == null ? 'null' : `${q(JSON.stringify(v))}::jsonb`);

const rows = products.map((p) =>
  `  (${[
    p.id, q(p.title), q(p.category), q(p.brand), arr(p.images), p.price, p.oldPrice ?? 'null',
    p.rating, p.reviews, p.sold, p.stock, p.minOrder, json(p.wholesale), json(p.colors),
    arr(p.sizes), q(p.description), p.flash, p.isNew,
  ].join(', ')})`,
);

const sql = `-- Import des ${products.length} articles de départ (à exécuter APRÈS schema.sql).
insert into public.products
  (id, title, category, brand, images, price, old_price, rating, reviews, sold, stock, min_order, wholesale, colors, sizes, description, flash, is_new)
overriding system value values
${rows.join(',\n')}
on conflict (id) do nothing;

-- Les prochains articles ajoutés continueront après le dernier identifiant.
select setval(pg_get_serial_sequence('public.products', 'id'), (select max(id) from public.products));
`;
writeFileSync('supabase/seed.sql', sql);
console.log(`supabase/seed.sql : ${products.length} articles`);
