DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_padron_est_num'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'PadronElectoral_establecimientoId_numeroMesa_idx'
  ) THEN
    ALTER INDEX "idx_padron_est_num"
      RENAME TO "PadronElectoral_establecimientoId_numeroMesa_idx";
  END IF;
END $$;
