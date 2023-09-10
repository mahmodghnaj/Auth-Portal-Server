export const transformToJSONWithId = function (schema) {
  schema.set('toJSON', { virtuals: true });
  schema.options.toJSON.transform = function (doc, ret) {
    ret.id = ret?._id?.toString();
    delete ret._id;
    delete ret.__v;
  };
};
