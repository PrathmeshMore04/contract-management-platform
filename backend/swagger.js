const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contract Management Platform API',
      version: '1.0.0',
      description: 'API documentation for the Contract Management Platform. This API allows you to manage blueprints (contract templates) and contracts with role-based access control.',
      contact: {
        name: 'API Support',
        email: 'support@contractmanagement.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        userRole: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-role',
          description: 'User role for authorization (admin, approver, signer). Defaults to admin if not provided.'
        }
      },
      schemas: {
        Field: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Field label/name',
              example: 'Contract Name'
            },
            fieldType: {
              type: 'string',
              enum: ['text', 'date', 'signature', 'checkbox'],
              description: 'Type of field'
            },
            position: {
              type: 'object',
              properties: {
                x: {
                  type: 'number',
                  description: 'X coordinate position',
                  example: 10,
                  default: 0
                },
                y: {
                  type: 'number',
                  description: 'Y coordinate position',
                  example: 20,
                  default: 0
                }
              }
            }
          },
          required: ['label', 'fieldType']
        },
        Blueprint: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Blueprint ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Blueprint name',
              example: 'Employment Contract Template'
            },
            fields: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Field'
              },
              description: 'Array of field definitions'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['name', 'fields']
        },
        Contract: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Contract ID',
              example: '507f1f77bcf86cd799439012'
            },
            blueprintId: {
              type: 'string',
              description: 'Reference to blueprint ID',
              example: '507f1f77bcf86cd799439011'
            },
            status: {
              type: 'string',
              enum: ['Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked'],
              description: 'Current contract status',
              example: 'Created'
            },
            data: {
              type: 'object',
              description: 'Field values entered for the contract',
              additionalProperties: true,
              example: {
                'Contract Name': 'John Doe Employment Contract',
                'Start Date': '2024-01-01'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['blueprintId']
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            },
            error: {
              type: 'object',
              description: 'Additional error details (only in development mode)'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Success message (optional)'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Blueprints',
        description: 'Blueprint (contract template) management endpoints'
      },
      {
        name: 'Contracts',
        description: 'Contract management and lifecycle endpoints'
      }
    ]
  },
  apis: ['./routes/*.js'] // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
