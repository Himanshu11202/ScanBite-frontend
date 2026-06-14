# ScanBite Backend (Spring Boot)

This is a scaffolded Spring Boot backend for ScanBite providing:

- Maven build
- PostgreSQL datasource configuration
- JWT authentication (stateless)
- Layered package structure (model, repository, controller, security, config)
- REST APIs for auth, menu and orders
- WebSocket (STOMP) for order notifications
- Global exception handling

To run locally:

1. Provide PostgreSQL DB and credentials in `src/main/resources/application.properties`.
2. Build and run:

```bash
cd backend
mvn spring-boot:run
```

This is a scaffold — expand services, DTOs, validation, and error handling as needed.
