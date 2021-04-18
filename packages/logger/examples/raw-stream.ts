// Example of a "raw" stream in a Bunyan Logger. A raw stream is one to
// which log record *objects* are written instead of the JSON-serialized
// string.

import { Logger } from '../src/logger';
import { LogFields } from '../src/types';

/**
 * A raw Bunyan Logger stream object. It takes raw log records and writes
 * them to stdout with an added "yo": "yo" field.
 */
class MyRawStream {
  write(rec: LogFields) {
    if (typeof rec !== 'object') {
      console.error('error: raw stream got a non-object record: %j', rec);
    } else {
      rec.yo = 'yo';
      process.stdout.write(JSON.stringify(rec) + '\n');
    }
  }
}

// A Logger using the raw stream.
const log = new Logger({
  name: 'raw-example',
  streams: [
    {
      level: 'info',
      stream: new MyRawStream(),
      type: 'raw'
    }
  ]
});

log.info('hi raw stream');
log.info({ foo: 'bar' }, 'added "foo" key');
