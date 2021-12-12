import { RootModule } from '@ditsmod/core';
import { RouterModule } from '@ditsmod/router';

import { HelloWorldController } from './hello-world.controller';
import { AuthModule } from './modules/services/auth/auth.module';

@RootModule({
  imports: [RouterModule, AuthModule],
  controllers: [HelloWorldController],
})
export class AppModule {}
