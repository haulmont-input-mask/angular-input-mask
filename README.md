#### Форк https://github.com/text-mask/text-mask

#Установка
Запустить npm i angular5-input-mask

#Документация
Для использования импортировать в модуль: InputMaskModule
* Станет доступна директива: inputMask, директива принимает в себя:
* Маску, в формате `mask` `[inputMask]='[ regExp | string, ]'`
* Pipe функцию постобрабортки `inputMaskPipe`
* Preset `inputMaskPreset` состящий из:
  * `mask = [ regExp | string, ]` массив regExp | string на каждый символ
  * `pipe? = (InputmaskPipe)` функция постобрабортки
  * `guide? = (boolean)` - Показывать маску при заполнении
  * `keepCharPositions? = (boolean)` - сдвигать ли уже добавленные символы при добавлении / удалении
  * `placeholderChar? = (string)` - Символ заполнитель маски

#Cборка
Перед коммитом требуется сборка: npm run packagr

#Расширенная документация

* Параметры:
  * [`mask`](#mask) ((RegExp /string)[]) - Маска
  * [`guide`](#guide) (boolean) - Показывать маску при заполнении
  * [`placeholderChar`](#placeholderchar) (string) - Заполнитель
  * [`keepCharPositions`](#keepcharpositions) (boolean)
  * [`pipe`](#pipe) (function) - Постобработка функцией
  * [`showMask`](#showmask) (boolean)
* [Included `conformToMask`](#included-conformtomask)
* [Supported `<input>` types](#supported-input-types)

## `mask`

`mask` Массив регулярных выражений или строк, каждый элемент которой соответствует символу в значении. 

Регулярное выражение будет использоваться для проверки пользовательского ввода и либо разрешить его, либо отклонить.

Например, маска для номера телефона в США, такого как `(555) 392-4932`, может быть:

```js
['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
```

Это означает, что пользователь может ввести только число от 1 до 9 в первом слоте, 
и только цифры далее. 

Примечание. Можно установить маску на `false`, чтобы полностью отключить маскировку.

## `guide`

`guide` - логическое значение, указывающее компоненту, должен ли он находиться в режиме * guide * или * no guide *.

**По у молчанию включен режим * guide *

<table>
<tbody>
<tr>
<th>Guide mode</th>
<th>No-guide mode</th>
</tr>

<tr>
<td>
<p align="center">
<img src="assets/guideMode.gif"/>
</p>

<p>
Когда включен режим * guide *, в текстовой маске всегда отображаются как символы-заполнители, так и символы маски не-заполнителя.
</p>
</td>

<td>
<p align="center">
<img src="assets/noGuideMode.gif"/>
</p>

</p>
В выключенном режиме * guide *, плагин добавляет символы заполнители только когда пользователь достигает их, вводом текста.
</p>
</td>
</tr>
</tbody>
</table>

## `placeholderChar`

Символ-заполнитель представляет собой слот в маске. 
Заполнитель по умолчанию символ подчеркивания, `_`.

Пример, для маски ...

```js
['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
```
 
... placeholder будет `(___) ___-____`.

Вы можете передать другой символ-заполнитель. Например, символ юникода `U + 2000`
сделать маску выше похожим на `() -`. В JavaScript вы должны передать такой символ юникода
как `'\u2000'`.

&#x1F4CD; **Внимание!**: нельзя использовать в маске символ заполнитель. 

## `keepCharPositions`

`keepCharPositions` изменяет поведение компонента Text Mask касаемо курсора ввода.

**It is set to `false` by default**,

<table>
<tbody>
<tr>
<th><code>keepCharPositions</code> is set to <code>true</code></th>
<th><code>keepCharPositions</code> is set to <code>false</code></th>
</tr>

<tr>
<td>
<p align="center">
<img src="assets/keepCharPositionsTrue.gif"/>
</p>

<p>
Когда режим включён <code>true</code>, изменение и удаление символов, не меняет положения уже 
введённых символов.
</p>
</td>

<td>
<p align="center">
<img src="assets/keepCharPositionsFalse.gif"/>
</p>

</p>
Когда режим выключен <code>false</code>, добавление и удаление символов, вдвигает остальные 
символы.
</p>
</td>
</tr>
</tbody>
</table>

## `pipe`

Pipe функция позволяет дополнительно обработать значение ( подтвердить / отвергнуть / дополнить ) перед отображением.

Функция принимает параметры:

1. conformedValue
1. PipeConfig

conformedValue - значение введенное пользователем и подтвержденной маской ввода.

Функция может вернуть 3 типа ответа : `false`, `string`, or `object`.

`false` - опровергает пользовательский ввод.

Функция может модифицировать строку после пользователя, когда функция модифицирует строку, она должна вернуть объект: 

1. `value`: новая строка
1. `indexesOfPipedChars`: массив целых чисел, который содержит индексы всех символов, которые были добавлены

Примеры:
[`createAutoCorrectedDatePipe`](https://github.com/text-mask/text-mask/blob/master/addons/src/createAutoCorrectedDatePipe.js)
 [Text Mask addon](https://github.com/text-mask/text-mask/tree/master/addons/#readme).


## `showMask`

`showMask` логическое значение, которое сообщает компоненту Text Mask отображать маску как
           placeholder вместо обычного заполнителя, когда значение входного элемента пусто.

---

### Поддерживаемые типы `<input>`

Обратите внимание: Text Mask поддерживает тип ввода `text`,` tel`, `url`,` password` и `search`. Из-за ограничения
в API браузера другие типы ввода, такие как `email` или` number`, не поддерживаются. 
 


### Fork `angular-library-seed` - the starter for Angular libraries
https://github.com/trekhleb/angular-library-seed#angular-library-seed---the-starter-for-angular-libraries

# Quick Start

```bash
# Clone the repository
git clone https://github.com/trekhleb/angular-library-seed.git

# Go to repository folder
cd angular-library-seed

# Install all dependencies
yarn install

# Build the library
yarn build
```

# File Structure

```
angular-library-seed
  ├─ demo                         * Folder for demo applications (MAY BE DELETED if not required) 
  |  ├─ esm                       * AOT/JIT demo project
  |  ├─ umd                       * UMD demo project
  |  └─ ...                       * More details about this folder may be found in demo folder README file.
  |
  ├─ src                          * Library sources home folder (THE PLACE FOR YOUR LIBRARY SOURCES)
  |  ├─ components                * Example of library components with tests
  |  ├─ services                  * Example of library services with tests
  |  ├─ index.ts                  * Library entry point that is used by builders
  |  └─ tick-tock.module.ts       * Example of library module
  |
  ├─ .editorconfig                * Common IDE configuration
  ├─ .gitignore	                  * List of files that are ignored while publishing to git repo
  ├─ .npmignore                   * List of files that are ignored while publishing to npm
  ├─ .travis.yml                  * Travic CI configuration
  ├─ LICENSE                      * License details
  ├─ README.md                    * README for you library
  ├─ gulpfile.js                  * Gulp helper scripts
  ├─ karma-test-entry.ts          * Entry script for Karma tests
  ├─ karma.conf.ts                * Karma configuration for our unit tests
  ├─ package.json                 * NPM dependencies, scripts and package configuration
  ├─ tsconfig-aot.json            * TypeScript configuration for AOT build
  ├─ tsconfig.json                * TypeScript configuration for UMD and Test builds
  ├─ tslint.json                  * TypeScript linting configuration
  ├─ webpack-test.config.ts       * Webpack configuration for building test version of the library
  ├─ webpack-umd.config.ts        * Webpack configuration for building UMD bundle
  └─ yarn.lock                    * Yarn lock file that locks dependency versions
```

# Getting Started

## Dependencies

#### Node/NPM
Install latest Node and NPM following the [instructions](https://nodejs.org/en/download/). Make sure you have Node version ≥ 7.0 and NPM ≥ 4.

- `brew install node` for Mac.

#### Yarn
[Yarn package manager](https://yarnpkg.com/en/) is optional but highly recommended. If you prefer to work with `npm` directly you may ignore this step.

Yarn installs library dependencies faster and also locks theirs versions. It has [more advantages](https://yarnpkg.com/en/) but these two are already pretty attractive. 

Install Yarn by following the [instructions](https://yarnpkg.com/en/docs/install).

- `brew install yarn` for Mac.

## Installing
- `fork` this repository.
- `clone` your fork to your local environment.
- `yarn install` to install required dependencies (or `npm i`).

## Build the library
- `yarn build` for building the library once (both ESM and AOT versions).
- `yarn build:watch` for building the library (both ESM and AOT versions) and watch for file changes.

You may also build UMD bundle and ESM files separately:
- `yarn build:esm` - for building AOT/JIT compatible versions of files.
- `yarn build:esm:watch` - the same as previous command but in watch-mode.
- `yarn build:umd` - for building UMD bundle only.
- `yarn build:umd:watch` - the same as previous command but in watch-mode.

## Other commands

#### Lint the code
- `yarn lint` for performing static code analysis.

#### Explore the bundle
- `yarn explorer` to find out where all your code in bundle is coming from.

#### Bump library version
- `npm version patch` to increase library version. [More on bumping](https://docs.npmjs.com/cli/version).

`preversion` script in this case will automatically run project testing and linting in prior in order to check that the library is ready for publishing.

#### Publish library to NPM
- `npm publish` to publish your library sources on [npmjs.com](https://www.npmjs.com/). Once the library is published it will be [available for usage](https://www.npmjs.com/package/angular-library-seed) in npm packages.

`prepublishOnly` script in this case will automatically run project testing and linting in prior in order to check that the library is ready for publishing.

#### Cleaning
- `yarn clean:tmp` command will clean up all temporary files like `docs`, `dist`, `coverage` etc.
- `yarn clean:all` command will clean up all temporary files along with `node_modules` folder. 

# Library development workflow

In order to debug your library in browser you need to have Angular project that will consume your library, build the application and display it. For your convenience all of that should happen automatically in background so once you change library source code you should instantly see the changes in browser.

There are several ways to go here:
- Use your **real library-consumer project** and link your library to it via `yarn link` command (see below).
- Use [demo applications](https://github.com/trekhleb/angular-library-seed/tree/master/demo) that are provided for your convenience as a part of this repository.
- Use [Angular-CLI](https://cli.angular.io/) to generate library-consumer project for you and then use `yarn link` to link your library to it.

### Using `yarn link`

In you library root folder:

```bash
# Create symbolic link
yarn link

# Build library in watch mode
yarn build:watch
```

In you project folder that should consume the library:

```bash
# Link you library to the project
yarn link "angular-library-seed"

# Build your project. In case of Angular-CLI use the following command.
ng serve --aot
```

Then you need to import your library into your project's source code.

Now, once you update your library source code it will automatically be re-compiled and your project will be re-built so you may see library changes instantly.

[More information](https://yarnpkg.com/en/docs/cli/link) about `yarn link` command.

