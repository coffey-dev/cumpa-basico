// config.js
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://prueba-gurudev.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjQyNTcyMTMsImlkIjoiMjMzMTYwOTktYzE3OS00MmNlLTk1NTAtMzZkY2M2ODIzNjMxIn0.jxHiOm0TFU4uYWlsthIpOEfabhqoyYL-0ICTQ_XCOBMQb9HJ_y6_39t-PG9Zv_pL7FEWtgW8M7-Td2mcK87QCA',
});

export default client;
