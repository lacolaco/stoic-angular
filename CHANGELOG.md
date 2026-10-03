# Changelog

## 1.0.0 (2026-10-03)


### ⚠ BREAKING CHANGES

* remove the preset configs so that each rule is enabled explicitly ([#5](https://github.com/lacolaco/stoic-angular/issues/5))

### Features

* add a typed configure function to enable rules one by one ([#6](https://github.com/lacolaco/stoic-angular/issues/6)) ([a229eb0](https://github.com/lacolaco/stoic-angular/commit/a229eb0df51c045478d1c20a9214cc365ade24d4))
* add defaults to enable every rule with per-rule overrides and exclusions ([#18](https://github.com/lacolaco/stoic-angular/issues/18)) ([e693279](https://github.com/lacolaco/stoic-angular/commit/e693279912b1d7bcffca724a53efe72cdb218d9e))
* add no-declarable-accessor to forbid getters and setters in components, directives and pipes ([#16](https://github.com/lacolaco/stoic-angular/issues/16)) ([12c1ee9](https://github.com/lacolaco/stoic-angular/commit/12c1ee9f863bf7ffc4de5c0891473c4b7af4c972))
* add no-declarable-private-method to forbid private methods in components, directives and pipes ([#15](https://github.com/lacolaco/stoic-angular/issues/15)) ([2624009](https://github.com/lacolaco/stoic-angular/commit/26240090280fc64a73e4255dc31c5fa690b01a5e))
* add no-extra-exports to require a file that exports an Angular class to export nothing else ([#20](https://github.com/lacolaco/stoic-angular/issues/20)) ([0d953ea](https://github.com/lacolaco/stoic-angular/commit/0d953ea6cd3af5766b5d1f89a09935f0e1bbcfd5))
* add no-inline-union to require union types to be written only inside type aliases ([#19](https://github.com/lacolaco/stoic-angular/issues/19)) ([d1f6c9d](https://github.com/lacolaco/stoic-angular/commit/d1f6c9d159466fc052cb62f9030a7e8bc7618ee9))
* add the call-or-pass rule ([#14](https://github.com/lacolaco/stoic-angular/issues/14)) ([dffab76](https://github.com/lacolaco/stoic-angular/commit/dffab767779cde21c7216aa3f23ed2e23745da01))
* add the if-only-at-start rule ([#7](https://github.com/lacolaco/stoic-angular/issues/7)) ([f733942](https://github.com/lacolaco/stoic-angular/commit/f7339426b44307bc6acb1459b17c8622b734ad22))
* add the max-function-lines rule as the first rule of eslint-plugin-stoic-angular ([#2](https://github.com/lacolaco/stoic-angular/issues/2)) ([f3a0e57](https://github.com/lacolaco/stoic-angular/commit/f3a0e572bf76f9ba5c84646e933f43556a6c9c5f))
* add the no-class-inheritance rule ([#13](https://github.com/lacolaco/stoic-angular/issues/13)) ([05b73d2](https://github.com/lacolaco/stoic-angular/commit/05b73d2525245c5a63491edf65d85a6622bd7b28))
* add the no-else rule ([#8](https://github.com/lacolaco/stoic-angular/issues/8)) ([d33e93c](https://github.com/lacolaco/stoic-angular/commit/d33e93cb834ed7ca6429536262c6a7c0e19fa497))
* add the no-switch rule ([#11](https://github.com/lacolaco/stoic-angular/issues/11)) ([0ff61de](https://github.com/lacolaco/stoic-angular/commit/0ff61de0db37f37e8494ac58c863703923fc66d7))
* add the prefer-inline-template rule ([#10](https://github.com/lacolaco/stoic-angular/issues/10)) ([b044071](https://github.com/lacolaco/stoic-angular/commit/b044071b864f45bb245952d4e69713ea8328c37d))
* let configure enable chosen ESLint core rules, starting with no-nested-ternary ([#12](https://github.com/lacolaco/stoic-angular/issues/12)) ([f845736](https://github.com/lacolaco/stoic-angular/commit/f8457362c8d888d8e15d55caa7f8ce5976534984))
* let configure enable the complexity and no-sequences core rules ([#17](https://github.com/lacolaco/stoic-angular/issues/17)) ([150d3a3](https://github.com/lacolaco/stoic-angular/commit/150d3a3e20d75f0df83d129df0d82f69578ef06d))
* remove the preset configs so that each rule is enabled explicitly ([#5](https://github.com/lacolaco/stoic-angular/issues/5)) ([d166c8a](https://github.com/lacolaco/stoic-angular/commit/d166c8a5e2d2e50390554fb8d6c3ff1e40590802))


### Bug Fixes

* rename the docs script to docs:generate ([#9](https://github.com/lacolaco/stoic-angular/issues/9)) ([b359687](https://github.com/lacolaco/stoic-angular/commit/b3596871664799175574af178fcdb74ad1233cc6))
