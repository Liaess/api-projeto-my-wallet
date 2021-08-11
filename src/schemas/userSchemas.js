import Joi from "joi";

export const signupSchema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(4).required()
})

export const signinschema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(4).required()
})

export const valueSchema = Joi.object({
    value: Joi.number().min(1).required()
});