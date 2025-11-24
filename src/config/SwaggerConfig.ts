import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express, Request, Response } from "express"
import {API_PREFIX, API_URL, NODE_ENV, PORT} from "../interfaces/utils/constants";
import logger from "../interfaces/logger/Logger"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ustabul API",
      version: "1.0.0",
      description: "Ustabul API Documentation",
    },
    servers: [
      {
        url:
          NODE_ENV === "production"
            ? `${API_URL}:${PORT}${API_PREFIX}`
            : `http://localhost:${PORT}${API_PREFIX}`,
        description:
          NODE_ENV === "production"
            ? "Production server"
            : "Local Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['src/docs/swagger/*.yaml'],
}

const swaggerSpec = swaggerJSDoc(options)

export const setupSwagger = (app: Express) => {
  //! if (nodeEnv !== "production") {
  app.use('/api-docs', (req, res, next) => {
    // CSP başlıklarını kaldır
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    // Güvenli olmayan istekleri yükseltme kısıtlamasını kaldır
    res.removeHeader('Upgrade-Insecure-Requests');
    next();
  });

  app.use(`${API_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get(`${API_PREFIX}/api-docs-json`, (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })

  logger.info(`Swagger is running on ${API_URL}:${PORT}${API_PREFIX}/api-docs`);
  //! }
}
