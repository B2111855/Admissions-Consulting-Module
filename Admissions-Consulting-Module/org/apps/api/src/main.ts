// src/main.ts
import 'reflect-metadata';

import express, { Express } from 'express';
import { database } from './config/db.config';
import { specs, swaggerUi } from './docs/swagger';
import { createExpressServer } from 'routing-controllers';

import { UserController } from './controllers/user.controller';
import { StudentController } from './controllers/student.controller';
import { CourseController } from './controllers/course.controller';
import { KPIStatisticsController } from './controllers/kpi-definition.controller';
import { UploadFormController } from './controllers/uploadform.controller';
import { ConsultingInformationManagementController } from './controllers/consulting-information-management.controller';
import { AuthController } from './controllers/auth.controller';
import { DashboardAnalyticsController } from './controllers/consultation-session.controller';
import { ExportController } from './controllers/sendexcel.controller'; // ✅ Import controller
import { DataGet } from './controllers/data.controller';
import { DataUpdate } from './controllers/updatedata.controller';
import { StudentStatistical } from './controllers/statistical-data.controller';
import { ExportWordController } from './controllers/exportword.controller';
import { ChatboxController } from './controllers/chatbox.controller';
import { StudentSaveController } from './controllers/student-save.controller';

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app: Express = createExpressServer({
  middlewares: [
    express.json(),
    express.urlencoded({ extended: true }),
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.log(`GLOBAL_REQUEST_LOG: ${req.method} ${req.url}`);
      next();
    },
  ],
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  },
  routePrefix: '/api',
  controllers: [
    DataGet,
    DataUpdate,
    UserController,
    StudentController,
    CourseController,
    KPIStatisticsController,
    ConsultingInformationManagementController,
    AuthController,
    UploadFormController,
    DashboardAnalyticsController,
    ExportController,
    StudentStatistical,
    ExportWordController,
    ChatboxController,
    StudentSaveController,
  ],
  defaultErrorHandler: false,
});

app.get('/health', async (req, res) => {
  const dbHealthy = await database.healthCheck();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, async () => {
  console.log(`🚀 Ready at http://${host}:${port}`);
  await database.connect();
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, starting graceful shutdown...');
  await database.disconnect();
  process.exit(0);
});

process.on('beforeExit', async () => {
  await database.disconnect();
});

export { app };
export default app;
