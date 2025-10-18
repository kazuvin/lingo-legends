import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Load OpenAPI spec
const openapiPath = join(__dirname, 'openapi', 'openapi.yaml');
const openapiDocument = yaml.load(readFileSync(openapiPath, 'utf8'));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Redirect root to /api-docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`Swagger UI is running at http://localhost:${PORT}/api-docs`);
});
