import Joi, { AnySchema, CustomHelpers } from 'joi';

enum FileListErrors {
  BASE = 'filelist.base',
  MIN = 'filelist.min',
  INVALID = 'filelist.invalid'
}

type FileListLike = FileList | File[];
type FileListMinArgs = { limit: number; }
type FileListMaxArgs = { limit: number; }
type FileListMaxSizeArgs = { limit: number; }
type FileListMimeTypeArgs = { mimeTypes: string[]; }
interface FileListSchema extends AnySchema {
  min(limit: number): this;
  max(limit: number): this;
  maxSize(limit: number): this;
  mimeType(mimeTypes: string[]): this;
}

export const fileListExtension = (joi: typeof Joi) => {
  return joi.extend(j => ({
    type: 'filelist',
    base: j.any(),
    messages: {
      'filelist.base': '{{#label}} must be a list of files',
      'filelist.min': '{{#label}} should contain at least {{#limit}} file(s)',
      'filelist.max': '{{#label}} should contain at most {{#limit}} file(s)',
      'filelist.maxsize': '"{{#fileName}}" is larger than {{#limit}}MB',
      'filelist.invalid': '"{{#fileName}}" is not valid'
    },
    validate(value, helpers) {
      if (
        typeof value !== 'object'
        || !(Array.from(value).every(v => v instanceof File))
      ) {
        return { value, errors: helpers.error(FileListErrors.BASE) };
      }
    },
    rules: {
      min: {
        args: [{
          name: 'limit',
          assert: v => typeof v === 'number',
          message: 'Limit must be a number'
        }],
        method(this: AnySchema, limit: number) {
          return this.$_addRule({ name: 'min', args: { limit } });
        },
        validate(value: FileListLike, helpers: CustomHelpers, args: FileListMinArgs) {
          if (value.length < args.limit) {
            return helpers.error('filelist.min', args);
          }
          return value;
        }
      },
      max: {
        args: [{
          name: 'limit',
          assert: v => typeof v === 'number',
          message: 'Limit must be a number'
        }],
        method(this: AnySchema, limit: number) {
          return this.$_addRule({ name: 'max', args: { limit } });
        },
        validate(value: FileListLike, helpers: CustomHelpers, args: FileListMaxArgs) {
          if (value.length > args.limit) {
            return helpers.error('filelist.max', args);
          }
          return value;
        }
      },
      maxSize: {
        args: [{
          name: 'limit',
          assert: v => typeof v === 'number',
          message: 'Limit must be a number'
        }],
        method(this: AnySchema, limit: number) {
          return this.$_addRule({ name: 'maxSize', args: { limit } });
        },
        validate(value: FileListLike, helpers: CustomHelpers, args: FileListMaxSizeArgs) {
          const tooLarge = Array.from(value).find(f => f.size > args.limit);
          if (tooLarge) {
            return helpers.error('filelist.maxsize', {
              fileName: tooLarge.name,
              limit: (args.limit / 1024 / 1024).toFixed(2),
            });
          }
          return value;
        }
      },
      mimeType: {
        args: [{
          name: 'mimeTypes',
          assert: v => Array.isArray(v) && v.every(t => typeof t === 'string'), message: 'MimeTypes must be an array of mime types'
        }],
        method(this: AnySchema, mimeTypes: string[]) {
          return this.$_addRule({ name: 'mimeType', args: { mimeTypes } });
        },
        validate(value: FileList, helpers: CustomHelpers, args: FileListMimeTypeArgs) {
          const isInvalidFile = Array.from(value).find(f => !args.mimeTypes.includes(f.type));
          if (isInvalidFile) {
            return helpers.error(FileListErrors.INVALID, {
              fileName: isInvalidFile.name
            });
          }
          return value;
        }
      }
    }
  })) as (typeof Joi & {
    filelist: () => FileListSchema
  });
}