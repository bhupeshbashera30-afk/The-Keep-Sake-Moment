-- Keepsake Moments - align products with the current website categories.
-- Payment/order tables are intentionally left untouched.

delete from public.products
where category not in (
  'hampers',
  'flowers',
  'crochets',
  'photobooth-rental',
  'dinner-night',
  'event-and-decor',
  'birthday',
  'anniversary',
  'proposal',
  'corporate',
  'special-occasion'
);

alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  add constraint products_category_check
  check (
    category in (
      'hampers',
      'flowers',
      'crochets',
      'photobooth-rental',
      'dinner-night',
      'event-and-decor',
      'birthday',
      'anniversary',
      'proposal',
      'corporate',
      'special-occasion'
    )
  );
