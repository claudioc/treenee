'use strict';

const Ajv = require('ajv');

class SchemaValidator {
  constructor(schema) {
    this.schema = require(`../${schema}`);
    this.ajv = new Ajv({
      allErrors: true
    });
  }

  validate(instance) {
    return this.ajv.validate(this.schema, instance);
  }

  errors() {
    const messages = [];
    // This is pretty lame as error management https://github.com/ajv-validator/ajv#validation-errors
    this.ajv.errors.forEach(error => {
      const moreInfo = JSON.stringify(error.params);
      messages.push(
        `In ${error.dataPath ? error.dataPath : 'tree'}: ${error.message} (${moreInfo})`
      );
    });

    return messages;
  }
}

module.exports = SchemaValidator;
