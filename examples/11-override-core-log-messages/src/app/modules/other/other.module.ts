import { featureModule, Providers } from '@ditsmod/core';
import { RouterModule } from '@ditsmod/router';

import { SomeModule } from '../some/some.module.js';
import { SomeLogMediator } from '../some/some-log-mediator.js';
import { OtherController } from './other.controller.js';
import { OtherLogMediator } from './other-log-mediator.js';

@featureModule({
  imports: [RouterModule, SomeModule],
  controllers: [OtherController],
  providersPerMod: [
    ...new Providers()
      .useClass(SomeLogMediator, OtherLogMediator)
  ],
})
export class OtherModule {}
