// A stand-in for the Angular decorator: the rule matches the name `Component` only
const Component = (_options: object) => (_target: unknown) => {};

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
})
export class SampleComponent {}
