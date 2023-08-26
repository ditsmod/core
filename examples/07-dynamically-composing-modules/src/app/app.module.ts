import { rootModule } from '@ditsmod/core';
import { RouterModule } from '@ditsmod/router';

import { FirstModule } from './modules/first/first.module.js';

@rootModule({
  imports: [RouterModule],
  appends: [FirstModule]
})
export class AppModule {}
