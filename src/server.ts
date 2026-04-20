import { app } from './app.js';
import { env } from './env.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
