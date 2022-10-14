import { Module } from '@ditsmod/core';
import { BodyParserConfig } from '@ditsmod/body-parser';

import { SomeController } from './some.controller';
import { SomeBodyParserConfig } from './some-body-parser-config.service';

@Module({
  controllers: [SomeController],
  providersPerMod: [{ provide: BodyParserConfig, useClass: SomeBodyParserConfig }],
})
export class SomeModule {}
