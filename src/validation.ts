import Joi from 'joi';
import { ValidationRule } from './types';
import { SheetFlowValidationError } from './errors';

const parseValidationRule = (rule: string): ValidationRule => {
  const parts = rule.split(':');
  const type = parts[0];
  const options = parts.slice(1);

  const validationRule: ValidationRule = { type };

  options.forEach(option => {
    if (option === 'required') {
      validationRule.required = true;
    } else if (option.startsWith('min(')) {
      validationRule.min = parseInt(option.slice(4, -1));
    } else if (option.startsWith('max(')) {
      validationRule.max = parseInt(option.slice(4, -1));
    } else if (option === 'email') {
      validationRule.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    }
  });

  return validationRule;
};

const buildJoiSchema = (schema: Record<string, string>) => {
  const joiSchema: Record<string, any> = {};

  Object.entries(schema).forEach(([field, rule]) => {
    const validationRule = parseValidationRule(rule);
    let validator: any;

    switch (validationRule.type) {
      case 'string':
        validator = Joi.string();
        if (validationRule.pattern) {
          validator = validator.pattern(validationRule.pattern);
        }
        break;
      case 'number':
        validator = Joi.number();
        if (validationRule.min !== undefined) {
          validator = validator.min(validationRule.min);
        }
        if (validationRule.max !== undefined) {
          validator = validator.max(validationRule.max);
        }
        break;
      case 'boolean':
        validator = Joi.boolean();
        break;
      case 'date':
        validator = Joi.date();
        break;
      case 'array':
        validator = Joi.array();
        break;
      default:
        validator = Joi.any();
    }

    if (validationRule.required) {
      validator = validator.required();
    }

    joiSchema[field] = validator;
  });

  return Joi.object(joiSchema);
};

export const validateSchema = async (data: any, schema: Record<string, string>) => {
  try {
    const joiSchema = buildJoiSchema(schema);
    await joiSchema.validateAsync(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof Error) {
      throw new SheetFlowValidationError('Validation failed', {
        details: error.message
      });
    }
    throw error;
  }
};
