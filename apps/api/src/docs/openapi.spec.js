const VISITOR_SITES = [
  'head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V',
  'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI',
  'phase XII', 'the gate', '2 acres'
];

const securityScheme = [{ AuthToken: [] }];

const errorResponse = {
  description: 'Error',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' }
    }
  }
};

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Visitor Management System API',
    version: '1.0.0',
    description: 'REST API for visitor registration, user management, and occurrence book operations. GraphQL endpoint available at `/graphql`.'
  },
  servers: [{ url: '/api', description: 'API base path' }],
  tags: [
    { name: 'Auth', description: 'Authentication and password reset' },
    { name: 'Users', description: 'User management (admin)' },
    { name: 'Visitors', description: 'Visitor CRUD and activity logs' },
    { name: 'Occurrence Book', description: 'Security occurrence book entries' }
  ],
  components: {
    securitySchemes: {
      AuthToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-auth-token',
        description: 'JWT access token from POST /auth/login'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          msg: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: { msg: { type: 'string' } }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin', 'pending'] },
          initials: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'active'] }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' }
            }
          }
        }
      },
      Visitor: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          ticketNumber: { type: 'string' },
          firstName: { type: 'string' },
          surname: { type: 'string' },
          nationalId: { type: 'string' },
          phoneNumber: { type: 'string' },
          address: { type: 'string' },
          vehicleReg: { type: 'string' },
          site: { type: 'string', enum: VISITOR_SITES },
          personToVisit: { type: 'string' },
          personToVisitOther: { type: 'string' },
          purpose: { type: 'string' },
          timeIn: { type: 'string', format: 'date-time' },
          timeOut: { type: 'string', format: 'date-time' },
          visitDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['active', 'completed', 'cancelled'] },
          cancelledAt: { type: 'string', format: 'date-time' }
        }
      },
      ActivityLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          userRole: { type: 'string' },
          action: { type: 'string' },
          targetType: { type: 'string' },
          targetId: { type: 'string' },
          details: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      OccurrenceBookEntry: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          time: { type: 'string' },
          entryNumber: { type: 'integer' },
          occurrence: { type: 'string' },
          securityId: { type: 'string' },
          securityInitials: { type: 'string' },
          site: { type: 'string', enum: VISITOR_SITES },
          adminSignatures: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Self-register (pending approval)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          400: errorResponse
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login success', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          400: errorResponse,
          403: errorResponse
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'New tokens' }, 401: errorResponse }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (revoke refresh token)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Logged out' } }
      }
    },
    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Logout from all devices',
        security: securityScheme,
        responses: { 200: { description: 'Logged out everywhere' }, 401: errorResponse }
      }
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Code sent' }, 404: errorResponse }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with verification code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code', 'newPassword'],
                properties: {
                  email: { type: 'string' },
                  code: { type: 'string', minLength: 6, maxLength: 6 },
                  newPassword: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Password reset' }, 400: errorResponse }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: securityScheme,
        responses: {
          200: {
            description: 'User list',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        security: securityScheme,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'security', 'reception', 'security_admin'] },
                  initials: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'User created' }, 400: errorResponse, 403: errorResponse }
      }
    },
    '/users/pending': {
      get: {
        tags: ['Users'],
        summary: 'List pending users',
        security: securityScheme,
        responses: {
          200: {
            description: 'Pending users',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
          }
        }
      }
    },
    '/users/approve/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Approve pending user',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin'] },
                  initials: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Approved' }, 403: errorResponse }
      }
    },
    '/users/{id}': {
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: errorResponse }
      }
    },
    '/visitors': {
      get: {
        tags: ['Visitors'],
        summary: 'Get all visitors',
        security: securityScheme,
        responses: {
          200: {
            description: 'Visitors',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Visitor' } } } }
          }
        }
      },
      post: {
        tags: ['Visitors'],
        summary: 'Register visitor',
        security: securityScheme,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'surname', 'nationalId', 'phoneNumber', 'address', 'site', 'personToVisit', 'purpose'],
                properties: {
                  firstName: { type: 'string' },
                  surname: { type: 'string' },
                  nationalId: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  address: { type: 'string' },
                  vehicleReg: { type: 'string' },
                  site: { type: 'string', enum: VISITOR_SITES },
                  personToVisit: { type: 'string' },
                  personToVisitOther: { type: 'string' },
                  purpose: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Visitor registered' } }
      }
    },
    '/visitors/logs': {
      get: {
        tags: ['Visitors'],
        summary: 'Get activity logs',
        security: securityScheme,
        responses: {
          200: {
            description: 'Activity logs',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ActivityLog' } } } }
          }
        }
      }
    },
    '/visitors/ticket/{ticketNumber}': {
      get: {
        tags: ['Visitors'],
        summary: 'Get visitor by ticket number',
        security: securityScheme,
        parameters: [{ name: 'ticketNumber', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Visitor', content: { 'application/json': { schema: { $ref: '#/components/schemas/Visitor' } } } },
          404: errorResponse
        }
      }
    },
    '/visitors/today': {
      get: {
        tags: ['Visitors'],
        summary: "Get today's visitors",
        security: securityScheme,
        responses: {
          200: {
            description: 'Today visitors',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Visitor' } } } }
          }
        }
      }
    },
    '/visitors/returning': {
      get: {
        tags: ['Visitors'],
        summary: 'Get returning visitors by national ID',
        security: securityScheme,
        responses: { 200: { description: 'Returning visitor groups' } }
      }
    },
    '/visitors/{id}': {
      put: {
        tags: ['Visitors'],
        summary: 'Update visitor',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Visitor' } } }
        },
        responses: { 200: { description: 'Updated' }, 404: errorResponse }
      },
      delete: {
        tags: ['Visitors'],
        summary: 'Delete visitor',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/visitors/{id}/timeout': {
      put: {
        tags: ['Visitors'],
        summary: 'Record visitor time-out',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Timed out' } }
      }
    },
    '/visitors/{id}/cancel': {
      put: {
        tags: ['Visitors'],
        summary: 'Cancel visitor',
        security: securityScheme,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cancelled' } }
      }
    },
    '/occurrence-book/next-entry/{site}': {
      get: {
        tags: ['Occurrence Book'],
        summary: 'Get next entry number for site',
        security: securityScheme,
        parameters: [{ name: 'site', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Next entry number' } }
      }
    },
    '/occurrence-book/my-entries': {
      get: {
        tags: ['Occurrence Book'],
        summary: 'Get my OB entries',
        security: securityScheme,
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string' } },
          { name: 'endDate', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Entries',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/OccurrenceBookEntry' } } } }
          }
        }
      }
    },
    '/occurrence-book/all': {
      get: {
        tags: ['Occurrence Book'],
        summary: 'Get all OB entries (admin)',
        security: securityScheme,
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string' } },
          { name: 'endDate', in: 'query', schema: { type: 'string' } },
          { name: 'securityId', in: 'query', schema: { type: 'string' } },
          { name: 'site', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'All entries' } }
      }
    },
    '/occurrence-book/security-guards': {
      get: {
        tags: ['Occurrence Book'],
        summary: 'List security guards',
        security: securityScheme,
        responses: { 200: { description: 'Guards list' } }
      }
    },
    '/occurrence-book': {
      post: {
        tags: ['Occurrence Book'],
        summary: 'Create OB entry',
        security: securityScheme,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date', 'time', 'entryNumber', 'occurrence', 'site'],
                properties: {
                  date: { type: 'string' },
                  time: { type: 'string' },
                  entryNumber: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
                  occurrence: { type: 'string' },
                  site: { type: 'string' },
                  initials: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Entry created' } }
      }
    },
    '/occurrence-book/sign-off': {
      post: {
        tags: ['Occurrence Book'],
        summary: 'Admin sign-off on daily entries',
        security: securityScheme,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['securityId', 'date', 'initials'],
                properties: {
                  securityId: { type: 'string' },
                  date: { type: 'string' },
                  initials: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Signed off' } }
      }
    }
  }
};

module.exports = spec;
