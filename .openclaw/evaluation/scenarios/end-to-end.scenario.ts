export const EndToEndScenarios = {
  'document-processing': {
    name: 'Document Processing Pipeline',
    steps: [
      {
        skill: 'document-v1',
        input: {
          content: 'This is a test document for processing.',
          chunkSize: 100,
          overlap: 20
        }
      },
      {
        skill: 'embedding-v1',
        input: {
          text: '{{previous.chunks[0].text}}',
          batch: true
        }
      },
      {
        skill: 'rag-v1',
        input: {
          query: 'What is this document about?',
          topK: 3
        }
      }
    ],
    expected: {
      success: true,
      minChunks: 1,
      minConfidence: 0.5
    },
    validator: (results: any[]) => {
      const docResult = results[0];
      const embedResult = results[1];
      const ragResult = results[2];
      
      return docResult.success && 
             embedResult.success && 
             ragResult.success &&
             docResult.totalChunks > 0 &&
             embedResult.vectors?.length > 0 &&
             ragResult.answer?.length > 0;
    }
  }
};
