DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='idx_padron_est_num'
  ) AND EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='PadronElectoral_establecimientoId_numeroMesa_idx'
  ) THEN
    -- hay duplicado; borramos el nuevo para que la migración pueda renombrar
    DROP INDEX IF EXISTS "idx_padron_est_num";
  END IF;
END $$;