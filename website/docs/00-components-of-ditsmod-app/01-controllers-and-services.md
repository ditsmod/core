---
sidebar_position: 1
---

# Роутер, контролери та сервіси

## Що робить роутер

Роутер має мапінг між URL та відповідним обробником запиту. Наприклад, коли користувач вашого вебсайту з браузера запитує адресу `/some-path` чи `/other-path`, чи `/path-with/:parameter` і т.д. - таким чином він повідомляє Ditsmod-застосунок, що хоче отримати певний ресурс, або хоче здійснити певну зміну на сайті. Щоб Ditsmod-застосунок знав, що саме треба робити в даних випадках, у його коді потрібно прописувати відповідні обробники запитів. Тобто, якщо запитують `/some-path`, значить треба виконати певну функцію; якщо запитують `/other-path`, значить треба виконати іншу функцію і т.д. Коли прописують подібну відповідність між адресою та її обробником - це і є процес створення мапінгу між URL та відповідним обробником запиту.

Хоча вам не прийдеться вручну писати цей мапінг, але для загального уявлення роботи роутера, у дуже спрощеному вигляді його можна уявити так:

```ts
const routes = new Map<string, Function>();
routes.set('/some-path', function() { /** обробка запиту... **/ });
routes.set('/other-path', function() { /** обробка запиту... **/ });
routes.set('/path-with/:parameter', function() { /** обробка запиту... **/ });
// ...
```

Зразу після того, як Node.js отримує HTTP-запит і передає його в Ditsmod, URL запиту розбивається на дві частини, які розділяються знаком питання (якщо він є). Перша частина завжди містить так званий _path_, а друга частина - _query-параметри_, якщо URL містить знак питання.

Задача роутера полягає в тому, щоб знайти обробник HTTP-запиту по _path_. У дуже спрощеному вигляді цей процес можна уявити так:

```ts
const path = '/some-path';
const handle = routes.get(path);

// ...
// І потім цей обробник викликається у функції, що прослуховує HTTP-запити.
if (handle) {
  handle();
}
```

У більшості випадків, обробник запиту викликає метод контролера. 

## Що являє собою контролер

Мапінг між URL та обробником запиту формується на основі метаданих, які закріпляються за методами контролерів. TypeScript клас стає контролером Ditsmod завдяки декоратору `controller`:

```ts
import { controller } from '@ditsmod/core';

@controller()
export class SomeController {}
```

Файли контролерів рекомендується називати із закінченням `*.controller.ts`, а імена їхніх класів - із закінченням `*Controller`.

Починаючи з v2.50.0, Ditsmod дає можливість працювати з контролером у двох режимах:

1. Контролер неодинак (по-дефолту). Його інстанс створюється за кожним HTTP-запитом.
2. Контролер [одинак][8]. Його інстанс створюється один раз на рівні модуля під час ініціалізації застосунку.

Перший варіант більш безпечний, коли потрібно працювати в контексті поточного HTTP-запиту (клієнт надає певний ідентифікатор, який необхідно враховувати для формування відповіді). Другий варіант роботи помітно швидший (приблизно на 15%) і споживає менше пам'яті, але контекст запиту не можна зберігати у властивостях інстансу контролера, бо цей інстанс може одночасно використовуватись для інших клієнтів. В другому варіанті контекст запиту прийдеться передавати лише як аргумент для методів.

Щоб Ditsmod працював з контролером як з [одинаком][8], в метаданих потрібно вказати `{ scope: 'module' }`:

```ts
import { controller } from '@ditsmod/core';

@controller({ scope: 'module' })
export class SomeController {}
```

### Контролер неодинак

Як вже було сказано вище, після того, як роутер знайшов обробника HTTP-запиту, цей обробник може викликати метод контролера. Щоб це стало можливим, спочатку HTTP-запити прив'язуються до методів контролерів через систему маршрутизації, з використанням декоратора `route`. В наступному прикладі створено єдиний маршрут, що приймає `GET` запит за адресою `/hello`:

```ts {6}
import { controller, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller()
export class HelloWorldController {
  @route('GET', 'hello')
  method1(res: Res) {
    res.send('Hello, World!');
  }
}
```

Що ми тут бачимо:

1. Маршрут створюється за допомогою декоратора `route`, що ставиться перед методом класу, причому не важливо як саме називається цей метод.
2. В методі класу оголошується параметр `res` з типом даних `Res`. Таким чином ми просимо Ditsmod щоб він створив інстанс класу `Res` і передав його у відповідну змінну. До речі, `res` - це скорочення від слова _response_.
3. Текстові відповіді на HTTP-запити відправляються через `res.send()`.

Хоча в попередньому прикладі інстанс класу `Res` запитувався через `method1`, але аналогічним чином ми можемо запитати цей інстанс і в конструкторі:

```ts {6}
import { controller, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller()
export class HelloWorldController {
  constructor(private res: Res) {}

  @route('GET', 'hello')
  method1() {
    this.res.send('Hello, World!');
  }
}
```

Звичайно ж, у параметрах можна запитувати й інші інстанси класів, причому послідовність параметрів є неважливою.

:::tip Використовуйте модифікатор доступу
Модифікатор доступу в конструкторі може бути будь-яким (private, protected або public), але взагалі без модифікатора - `res` вже буде простим параметром з видимістю лише в конструкторі.
:::

Щоб отримати `pathParams` чи `queryParams`, доведеться скористатись декоратором `inject` та токенами `PATH_PARAMS` і `QUERY_PARAMS`:

```ts {8-9}
import { controller, Res, inject, AnyObj, PATH_PARAMS, QUERY_PARAMS } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller()
export class SomeController {
  @route('GET', 'some-url/:param1/:param2')
  method1(
    @inject(PATH_PARAMS) pathParams: AnyObj,
    @inject(QUERY_PARAMS) queryParams: AnyObj,
    res: Res
  ) {
    res.sendJson({ pathParams, queryParams });
  }
}
```

Більше інформації про те, що таке **токен** та що саме робить декоратор `inject` ви можете отримати з розділу [Dependecy Injection][4].

Як бачите з попереднього прикладу, щоб відправляти відповіді з об'єктами, необхідно використовувати метод `res.sendJson()` замість `res.send()` (бо він відправляє тільки текст).

Рідні Node.js об'єкти запиту та відповіді можна отримати за токенами відповідно - `RAW_REQ` та `RAW_RES`:

```ts {7-8}
import { controller, inject, RAW_REQ, RAW_RES, RawRequest, RawResponse } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller()
export class HelloWorldController {
  constructor(
    @inject(RAW_REQ) private rawReq: RawRequest,
    @inject(RAW_RES) private rawRes: RawResponse
  ) {}

  @route('GET', 'hello')
  method1() {
    this.rawRes.end('Hello, World!');
  }
}
```

Вас також може зацікавити [як можна отримати тіло HTTP-запиту][5].

### Контролер одинак

Через те, що інстанс контролера у цьому режимі створюється єдиний раз, ви не зможете запитувати у його конструкторі інстанси класів, які створюються за кожним запитом. Наприклад, якщо в конструкторі ви запросите інстанс класу `Res`, Ditsmod кине помилку:

```ts {4,6}
import { controller, RequestContext } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller({ scope: 'module' })
export class HelloWorldController {
  constructor(private res: Res) {}

  @route('GET', 'hello')
  method1() {
    this.res.send('Hello, World!');
  }
}
```

Робочий варіант буде таким:

```ts {4,7}
import { controller, RequestContext } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller({ scope: 'module' })
export class HelloWorldController {
  @route('GET', 'hello')
  method1(ctx: RequestContext) {
    ctx.send('Hello, World!');
  }
}
```

В режимі "контролер-одинак", методи контролерів, що прив'язані до певних роутів, отримують єдиний аргумент - контекст запиту. Тобто в цьому режимі ви вже не зможете запитати у Ditsmod, щоб він передавав у ці методи інстанси інших класів. Разом з тим, в конструкторі ви все ще можете запитувати інстанси певних класів, які створюються єдиний раз.

## Прив'язка контролера до модуля

Прив'язується контролер до модуля через масив `controllers`:

```ts {5}
import { featureModule } from '@ditsmod/core';
import { SomeController } from './some.controller.js';

@featureModule({
  controllers: [SomeController]
})
export class SomeModule {}
```

Після прив'язки контролерів до модуля, щоб Ditsmod брав до уваги ці контролери, даний модуль потрібно або прикріпити, або імпортувати у формі об'єкта, що має інтерфейс [ModuleWithParams][2]. В наступному прикладі показано і прикріплення, і повний імпорт модуля (це зроблено лише щоб продемонструвати можливість, на практиці немає сенсу робити одночасне прикріплення з імпортом):

```ts {5-7}
import { featureModule } from '@ditsmod/core';
import { SomeModule } from './some.module.js';

@featureModule({
  appends: [SomeModule],
  // АБО
  imports: [{ path: 'some-prefix', module: SomeModule }]
})
export class OtherModule {}
```

Якщо модуль імпортується без властивості `path`, Ditsmod буде імпортувати лише його [провайдери][3] та [розширення][9]:

```ts {5}
import { featureModule } from '@ditsmod/core';
import { SomeModule } from './some.module.js';

@featureModule({
  imports: [SomeModule]
})
export class OtherModule {}
```

Більш докладну інформацію ви можете прочитати у розділі [Експорт, імпорт та прикріплення модулів][1].

## Сервіси

Хоча з технічної точки зору, для обробки HTTP-запиту можна обійтись одним лише контролером, але об'ємний код з бізнес логікою краще виносити в окремі класи, щоб при потребі можна було повторно використовувати цей код, і щоб його можна було простіше тестувати. Ці окремі класи з бізнес логікою, як правило, називають _сервісами_.

Що можуть робити сервіси:

- надавати конфігурацію;
- робити валідацію запиту;
- робити парсинг тіла запиту;
- перевіряти права доступу;
- парцювати з базами даних, з поштою;
- і т.п.

Будь-який TypeScript клас може бути сервісом Ditsmod, але якщо ви хочете щоб [DI][7] вирішував залежність, яку ви вказуєте в конструкторах даних класів, перед ними необхідно прописувати декоратор `injectable`:

```ts {4,6}
import { injectable } from '@ditsmod/core';
import { FirstService } from './first.service.js';

@injectable()
export class SecondService {
  constructor(private firstService: FirstService) {}

  methodOne() {
    this.firstService.doSomeThing();
  }
}
```

Файли сервісів рекомендується називати із закінченням `*.service.ts`, а їхні класи - із закінченням `*Service`.

Як бачите, правила отримання інстансу класу в конструкторі такі ж, як і в контролерах: за допомогою модифікатора доступу `private` оголошуємо властивість класу `firstService` з типом даних `FirstService`.

Щоб можна було користуватись новоствореними класами сервісів, їх потрібно передати у метадані **поточного** модуля чи контролера. Передати сервіси у метадані модуля можна наступним чином:

```ts {7-8}
import { featureModule } from '@ditsmod/core';
import { FirstService } from './first.service.js';
import { SecondService } from './second.service.js';

@featureModule({
  providersPerReq: [
    FirstService,
    SecondService
  ],
})
export class SomeModule {}
```

Аналогічно сервіси передаються у метадані контролера:

```ts {9-10}
import { controller, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

import { FirstService } from './first.service.js';
import { SecondService } from './second.service.js';

@controller({
  providersPerReq: [
    FirstService,
    SecondService
  ],
})
export class SomeController {
  @route('GET', 'hello')
  method1(res: Res, secondService: SecondService) {
    res.send(secondService.sayHello());
  }
}
```

В останніх двох прикладах сервіси передаються у масив `providersPerReq`, але це не єдиний спосіб передачі сервісів. Більш докладну інформацію про правила роботи з DI можна отримати у розділі [Dependency Injection][7].

[1]: /developer-guides/exports-and-imports#імпорт-модуля
[2]: /developer-guides/exports-and-imports#ModuleWithParams
[3]: /components-of-ditsmod-app/dependency-injection#провайдери
[4]: /components-of-ditsmod-app/dependency-injection#токен-залежності
[5]: /native-modules/body-parser#отримання-тіла-запиту
[6]: https://github.com/ditsmod/ditsmod/blob/core-2.54.0/packages/core/src/services/pre-router.ts
[7]: /components-of-ditsmod-app/dependency-injection
[8]: https://uk.wikipedia.org/wiki/%D0%9E%D0%B4%D0%B8%D0%BD%D0%B0%D0%BA_(%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD_%D0%BF%D1%80%D0%BE%D1%94%D0%BA%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F) "Singleton"
[9]: /components-of-ditsmod-app/extensions/
