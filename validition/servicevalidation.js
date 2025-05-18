
const Joi = require('joi');

const serviceSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.base': "title must be a string",
    'string.empty': "title is required",
    'any.required': "title is required",
  }),
  category: Joi.string().required().messages({
    'string.base': "category must be a string",
    'string.empty': "category is required",
    'any.required': "category is required",
  }),
  exprience:Joi.string().required().messages({
    'string.base': "exprience must be a string",
    'string.empty': "exprience is required",
    'any.required': "exprience is required",
  }),
  address:Joi.string().messages({
    'string.base': "address must be a string",
    'string.empty': "address is required",
     'any.required': "address is required",
  }),
  profileImage: Joi.string().required().messages({
    'string.base': "profileImage must be a string",
    'string.empty': "profileImage is required",
    'any.required': "profileImage is required",
  }),
  serviceImage: Joi.array()
  .items(Joi.string().messages({
    'string.base': 'Each item in workImages must be a string',
    'any.required': "workImages is required",
    'string.empty': "workImages is required",
    }))
  .min(1)
  .required()
  .messages({
    'array.base': 'serviceImage must be an array',
    'array.min': 'At least one serviceImage is required',
    'any.required': 'serviceImage is required'
  }),
  serviceDetails: Joi.string().required().messages({
    'string.base': "serviceDetails must be a string",
    'string.empty': "serviceDetails is required",
    'any.required': "serviceDetails is required",
  }),
  phone: Joi.string().required().messages({
    'string.base': "phone must be a string",
    'string.empty': "phone is required",
    'any.required': "serviceDetails is required",
  }),
  facebookLink:Joi.string().messages({
    'string.base': "facebookLink must be a string",
  }),
 instgrameLink:Joi.string().messages({
    'string.base': "instgrameLink must be a string",
  }),
 likes:Joi.string().messages({
    'string.base': "likes must be a string",
  }),
});

module.exports={
serviceSchema
}