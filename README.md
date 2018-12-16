# Tasks Fetch
This library is a wrapper of the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to use with [Tasks](https://github.com/ts-task/task) instead of promises.

### Use

**Install it**

```bash
npm i @ts-task/fetch
```

**Use it**
```typescript
import { fetch } from '@ts-task/fetch';

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .chain(response => response.json())
  .fork(
      err => console.error('Oh no', err),
      json => console.log(json)
    )
;
```
