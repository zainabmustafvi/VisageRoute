// Face recognition pipeline removed.
// This stub prevents startup-time crashes from missing ML dependencies.

module.exports = {
  extractFaceEmbedding: async () => {
    // Intentionally no-op.
    return null;
  },

  // Optional helpers retained as safe no-ops.
  compareEmbeddings: () => 1.0,
  cosineSimilarity: () => 0
};

