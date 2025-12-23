import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PAMBAZO API',
            version: '1.0.0',
            description: 'API para el sistema de gestión de panadería PAMBAZO',
            contact: {
                name: 'PAMBAZO Team',
                email: 'admin@pambazo.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de desarrollo'
            },
            {
                url: 'https://api.pambazo.com',
                description: 'Servidor de producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['owner', 'admin', 'waiter', 'kitchen', 'customer', 'baker'] },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        phone: { type: 'string' },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        category_id: { type: 'string' },
                        image_url: { type: 'string' },
                        is_available: { type: 'boolean' },
                        preparation_time: { type: 'integer' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        customer_id: { type: 'string' },
                        table_id: { type: 'string' },
                        waiter_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'] },
                        total: { type: 'number' },
                        tip: { type: 'number' },
                        notes: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./api/routes/**/*.ts', './api/controllers/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PAMBAZO API Documentation'
};

export { swaggerUi };
