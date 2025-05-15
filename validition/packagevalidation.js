
const Joi = require('joi');

const packagevalidation = Joi.object({
  title: Joi.string().required().messages({
    'string.base': 'title must be a string',
    'string.empty': 'title is required',
    'any.required': 'price is required',
  }),
  price: Joi.string().required().messages({
    'string.base': 'price must be a string',
    'string.empty': 'price is required',
    'any.required': 'price is required',
  }),
});

module.exports={
packagevalidation
}