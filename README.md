# joi-filelist
This package provides an extension to `Joi` for `FileList` types (also works on an array of files)

## Usage
Simply import the `fileListExtension` method and wrap it around `Joi`
```js
import BaseJoi from 'joi';
import { fileListExtension } from 'joi-filelist';
export const Joi = fileListExtension(BaseJoi);
```

After wrapping `Joi` you can simply use it like any other type that is already supported by default.

Example:
```js
import { Joi } from './joi';
const schema = Joi.object({
  files: Joi.filelist()
});
```

### filelist.min
The minimum number of items in the file list
```js
const schema = Joi.object({
  files: Joi.filelist().min(2)
});
```
Possible validation errors: `filelist.min`

### filelist.max
The maximum number of items in the file list
```js
const schema = Joi.object({
  files: Joi.filelist().max(4)
});
```
Possible validation errors: `filelist.max`

### filelist.maxsize
The maximum size in bytes for a file.
```js
const schema = Joi.object({
  files: Joi.filelist().maxSize(1024 * 1024 * 1)
});
```
Possible validation errors: `filelist.maxsize`

### filelist.mimeType
The allowed MIME types for this file list
```js
const schema = Joi.object({
  files: Joi.filelist().mimeType(['image/jpeg', 'image/jpg'])
});
```
Possible validation errors: `filelist.invalid`