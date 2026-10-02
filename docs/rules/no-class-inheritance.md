# stoic-angular/no-class-inheritance

📝 Forbids inheriting from classes and requires sharing implementation through delegation.

<!-- end auto-generated rule header -->

A class should not inherit from another class. Inherit only from interfaces, and share implementation through delegation.

## Rule details

The rule reports the `extends` clause of every class declaration and class expression. The report is placed on the `superClass` expression.

- Any superclass is reported: an ordinary class, an abstract class, or a built-in class such as `Error`.
- `implements` is allowed.
- `extends` between interfaces is allowed.

The rule has no options. It forbids inheritance uniformly, so a place that really needs it has to opt out with a disable comment (see below).

This is the "Only inherit from interfaces" rule from _Five Lines of Code_ by Christian Clausen. Inheriting implementation couples a subclass to the internals of its superclass: a change to the base class can break every subclass, and the subclass cannot be understood without reading the base. Implementing an interface fixes only the contract, and delegation shares behavior through an explicit, replaceable collaborator.

### Examples

Examples of incorrect code for this rule:

```ts
class Base {
  value = 1;
}
class Derived extends Base {}
```

```ts
abstract class Shape {
  abstract area(): number;
}
class Square extends Shape {
  area(): number {
    return 4;
  }
}
```

```ts
class Base {}
const Derived = class extends Base {};
```

Examples of correct code for this rule:

```ts
interface Runner {
  run(): void;
}
class TaskRunner implements Runner {
  run(): void {}
}
```

```ts
interface Base {
  id: string;
}
interface Extended extends Base {
  name: string;
}
```

```ts
class Standalone {
  value = 1;
}
```

## Instead of inheritance

Replace the superclass with an interface for the contract, and move the shared implementation into a class that the others hold and call.

```ts
// Before
class Logger {
  log(message: string): void {
    console.log(message);
  }
}
class OrderService extends Logger {
  place(): void {
    this.log('placed');
  }
}
```

```ts
// After
interface Logger {
  log(message: string): void;
}
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}
class OrderService {
  constructor(private readonly logger: Logger) {}

  place(): void {
    this.logger.log('placed');
  }
}
```

## Opting out

Some classes have to extend a class: `Error` subclasses, or base classes that a framework requires. The rule does not distinguish them. Disable it on the line and write the reason after `--`:

```ts
// eslint-disable-next-line stoic-angular/no-class-inheritance -- Error subclasses are the standard way to define typed errors
class NotFoundError extends Error {}
```
