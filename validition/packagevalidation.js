
const Joi = require('joi');

const packagevalidation = Joi.array().items(
  Joi.object({
    title: Joi.string().required().messages({
      'string.base': 'title must be a string',
      'string.empty': 'title is required',
      'any.required': 'title is required',
    }),
    price: Joi.string().required().messages({
      'number.base': 'price must be a number',
      'any.required': 'price is required',
    })
  })
);

module.exports={
packagevalidation
}