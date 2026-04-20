import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL?.trim() || 'https://mnxsvjrqrayhbcmhwddz.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY?.trim() || 'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv';

const STORAGE_PUBLIC_PATH_SEGMENT = '/storage/v1/object/public/';
const IMAGE_VARIANT_MARKER = '__hpimg__';
const IMAGE_VARIANT_REGEX = new RegExp(`${IMAGE_VARIANT_MARKER}(base|card|popup)(?=\\.[^.]+$)`);
const SHOULD_WRITE = process.argv.includes('--write');

const VARIANTS_BY_FOLDER = {
  banners: ['card'],
  popups: ['popup'],
  'description-images': ['card'],
  notices: ['card'],
  'installation-cases': ['card'],
  'main-reviews': ['card'],
  'product-images': ['card'],
  products: ['card'],
};

const TABLE_SPECS = [
  {
    table: 'nav_menu_items',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'banners',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'popups',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'installation_cases',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'notice_posts',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'products',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'main_review_cards',
    select: 'id,image_url',
    extract: (row) => [row.image_url],
  },
  {
    table: 'page_contents',
    select: 'id,page_key,content',
    extract: (row) => collectManagedImageUrls(row.content),
  },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const hasVariantMarker = (value) =>
  typeof value === 'string' && IMAGE_VARIANT_REGEX.test(value);

const replaceVariantMarker = (value, variantName) =>
  value.replace(IMAGE_VARIANT_REGEX, `${IMAGE_VARIANT_MARKER}${variantName}`);

const getErrorText = (error) =>
  error?.message || error?.error || error?.details || 'Unknown error';

const isAlreadyExistsError = (error) =>
  getErrorText(error).toLowerCase().includes('already exists');

const collectManagedImageUrls = (value, found = new Set()) => {
  if (typeof value === 'string') {
    if (value.includes(STORAGE_PUBLIC_PATH_SEGMENT) && hasVariantMarker(value)) {
      found.add(value);
    }
    return [...found];
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectManagedImageUrls(item, found));
    return [...found];
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectManagedImageUrls(item, found));
  }

  return [...found];
};

const parseBucketAndPathFromUrl = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.includes(STORAGE_PUBLIC_PATH_SEGMENT)) return null;

  try {
    const url = new URL(imageUrl);
    const [, suffix = ''] = url.pathname.split(STORAGE_PUBLIC_PATH_SEGMENT);
    const [bucket, ...pathParts] = suffix.split('/').filter(Boolean);

    if (!bucket || pathParts.length === 0) return null;

    return {
      bucket,
      path: pathParts.join('/'),
    };
  } catch {
    return null;
  }
};

const fetchRows = async (table, select) => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set('select', select);

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${table} fetch failed (${response.status}): ${await response.text()}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

const collectBackfillTasks = async () => {
  const tasks = new Map();

  for (const spec of TABLE_SPECS) {
    let rows = [];

    try {
      rows = await fetchRows(spec.table, spec.select);
    } catch (error) {
      console.warn(`[skip] ${spec.table}: ${getErrorText(error)}`);
      continue;
    }

    rows.forEach((row) => {
      const urls = spec.extract(row)
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean);

      urls.forEach((imageUrl) => {
        const parsed = parseBucketAndPathFromUrl(imageUrl);
        if (!parsed || !hasVariantMarker(parsed.path)) return;

        const [folder] = parsed.path.split('/');
        const variants = VARIANTS_BY_FOLDER[folder] || [];
        if (variants.length === 0) return;

        const basePath = replaceVariantMarker(parsed.path, 'base');

        variants.forEach((variantName) => {
          const variantPath = replaceVariantMarker(basePath, variantName);
          if (variantPath === basePath) return;

          const taskKey = `${parsed.bucket}:${variantPath}`;
          const existing = tasks.get(taskKey);

          if (existing) {
            existing.sources.add(`${spec.table}:${row.id || row.page_key || 'unknown'}`);
            return;
          }

          tasks.set(taskKey, {
            bucket: parsed.bucket,
            sourcePath: basePath,
            variantPath,
            variantName,
            sources: new Set([`${spec.table}:${row.id || row.page_key || 'unknown'}`]),
          });
        });
      });
    });
  }

  return [...tasks.values()];
};

const run = async () => {
  const tasks = await collectBackfillTasks();

  if (tasks.length === 0) {
    console.log('No variant backfill tasks found.');
    return;
  }

  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of tasks) {
    const sourceLabel = [...task.sources].join(', ');
    const summary = `${task.bucket}:${task.sourcePath} -> ${task.variantPath} (${sourceLabel})`;

    if (!SHOULD_WRITE) {
      console.log(`[dry-run] ${summary}`);
      skipped += 1;
      continue;
    }

    const { error } = await supabase.storage.from(task.bucket).copy(task.sourcePath, task.variantPath);

    if (!error) {
      console.log(`[copied] ${summary}`);
      copied += 1;
      continue;
    }

    if (isAlreadyExistsError(error)) {
      console.log(`[exists] ${summary}`);
      skipped += 1;
      continue;
    }

    console.error(`[error] ${summary}: ${getErrorText(error)}`);
    failed += 1;
  }

  console.log(
    JSON.stringify(
      {
        mode: SHOULD_WRITE ? 'write' : 'dry-run',
        total: tasks.length,
        copied,
        skipped,
        failed,
      },
      null,
      2,
    ),
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error('Variant backfill failed:', error);
  process.exitCode = 1;
});
