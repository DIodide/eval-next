-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE player_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  embedding vector(768) NOT NULL,
  embedding_text TEXT NOT NULL,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP(6) DEFAULT NOW()
);

-- CreateIndex
CREATE INDEX player_embeddings_player_id_idx ON player_embeddings(player_id);

-- CreateIndex (IVFFlat index for fast similarity search)
-- Note: For production, adjust the 'lists' parameter based on your data size
-- Rule of thumb: lists = sqrt(number_of_rows), minimum 1
CREATE INDEX player_embeddings_vector_idx ON player_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
