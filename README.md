# Unrest

[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/Pyriter)

## Description

Request routing for AWS Lambda running Nodejs, written in Typescript

Motivation: Existing routing libraries are inefficient. This library uses a trie data structure with local caching to
improve lookup and response time. (More latency data to come)

## Install

```bash
npm install @pyriter/unrest
```

## Features

1. Define routes
2. Define controllers
3. Type the request body
4. Support for URL parameters
5. Query string parameter handling
6. Request body validation
7. Response building with status codes
8. AWS Lambda integration

## One Time Setup

Set the `"noStrictGenericChecks"` to true in your tsconfig to avoid typescript errors

```json
{
  "compilerOptions": {
    ...
    "noStrictGenericChecks": true,
    ...
  }
}
```

## Usage

### Basic Setup

```typescript
import { StatusType, Unrest, MethodType } from "@pyriter/unrest";
import { APIGatewayProxyEvent } from "aws-lambda";
import { UnrestResponse } from "./unrestResponse";
import { RequestProps } from "./route";

class ApiServiceHandler {
  private readonly unrest: Unrest;

  constructor() {
    this.unrest = Unrest.builder()
      .withRoute({
        method: MethodType.GET,
        path: "/api/v1/ping",
        handler: async (): Promise<Response> => {
          return Response.builder()
            .withStatusCode(StatusType.OK)
            .withBody({
              message: "success"
            }).build();
        }
      })
      .build();
  }

  async handle(event: APIGatewayProxyEvent): Promise<UnrestResponse> {
    return await this.unrest.execute(event);
  }
}
```

### Controller Pattern

Create controllers to organize your API endpoints:

```typescript
import { RequestProps, Response, StatusType, Unrest, MethodType } from '@pyriter/unrest';

export class UserController {
  constructor(private readonly unrest: Unrest) {
    this.unrest.withRoutes([
      {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: this.getAllUsers,
        thisReference: this,
      },
      {
        method: MethodType.GET,
        path: '/api/v1/users/{userId}',
        handler: this.getUserById,
        thisReference: this,
      },
      {
        method: MethodType.POST,
        path: '/api/v1/users',
        handler: this.createUser,
        thisReference: this,
      },
      {
        method: MethodType.PUT,
        path: '/api/v1/users/{userId}',
        handler: this.updateUser,
        thisReference: this,
      },
      {
        method: MethodType.DELETE,
        path: '/api/v1/users/{userId}',
        handler: this.deleteUser,
        thisReference: this,
      },
    ]);
  }

  async getAllUsers(request: RequestProps<undefined>): Promise<Response<User[] | string>> {
    try {
      const { apiGatewayEvent, queryStringParams } = request;
      const { limit, offset } = queryStringParams;
      
      // Your business logic here
      const users = await this.userService.getUsers({ limit, offset });
      
      return Response.builder<User[]>()
        .withStatusCode(StatusType.OK)
        .withBody(users)
        .build();
    } catch (error) {
      return Response.builder<string>()
        .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
        .withBody(`Error fetching users: ${error}`)
        .build();
    }
  }

  async getUserById(request: RequestProps<undefined>): Promise<Response<User | string>> {
    try {
      const { urlParams } = request;
      const userId = urlParams.userId || '';
      
      if (!userId) {
        return Response.builder<string>()
          .withStatusCode(StatusType.BAD_REQUEST)
          .withBody('userId is required')
          .build();
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        return Response.builder<string>()
          .withStatusCode(StatusType.NOT_FOUND)
          .withBody('User not found')
          .build();
      }

      return Response.builder<User>()
        .withStatusCode(StatusType.OK)
        .withBody(user)
        .build();
    } catch (error) {
      return Response.builder<string>()
        .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
        .withBody(`Error fetching user: ${error}`)
        .build();
    }
  }

  async createUser(request: RequestProps<CreateUserRequest>): Promise<Response<User | string>> {
    try {
      const { body, apiGatewayEvent } = request;
      const { name, email, role } = body;
      
      // Validate required fields
      if (!name || !email) {
        return Response.builder<string>()
          .withStatusCode(StatusType.BAD_REQUEST)
          .withBody('Name and email are required')
          .build();
      }

      const user = await this.userService.createUser({ name, email, role });
      
      return Response.builder<User>()
        .withStatusCode(StatusType.CREATED)
        .withBody(user)
        .build();
    } catch (error) {
      return Response.builder<string>()
        .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
        .withBody(`Error creating user: ${error}`)
        .build();
    }
  }

  async updateUser(request: RequestProps<UpdateUserRequest>): Promise<Response<User | string>> {
    try {
      const { urlParams, body, apiGatewayEvent } = request;
      const userId = urlParams.userId || '';
      const { name, email, role } = body;

      if (!userId) {
        return Response.builder<string>()
          .withStatusCode(StatusType.BAD_REQUEST)
          .withBody('userId is required')
          .build();
      }

      const updatedUser = await this.userService.updateUser(userId, { name, email, role });
      
      return Response.builder<User>()
        .withStatusCode(StatusType.OK)
        .withBody(updatedUser)
        .build();
    } catch (error) {
      return Response.builder<string>()
        .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
        .withBody(`Error updating user: ${error}`)
        .build();
    }
  }

  async deleteUser(request: RequestProps<undefined>): Promise<Response<boolean | string>> {
    try {
      const { urlParams } = request;
      const userId = urlParams.userId || '';

      if (!userId) {
        return Response.builder<string>()
          .withStatusCode(StatusType.BAD_REQUEST)
          .withBody('userId is required')
          .build();
      }

      await this.userService.deleteUser(userId);
      
      return Response.builder<boolean>()
        .withStatusCode(StatusType.OK)
        .withBody(true)
        .build();
    } catch (error) {
      return Response.builder<string>()
        .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
        .withBody(`Error deleting user: ${error}`)
        .build();
    }
  }
}
```

### Service Handler Integration

Wire up your controllers in a main service handler:

```typescript
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unrest, UnrestResponse } from '@pyriter/unrest';

export class ServiceHandler {
  constructor(
    private readonly userController: UserController,
    private readonly orderController: OrderController,
    private readonly productController: ProductController,
    private readonly unrest: Unrest,
  ) {
    // Controllers have configured their routes, build the Unrest instance
  }

  async handle(event: APIGatewayProxyEvent): Promise<UnrestResponse> {
    return await this.unrest.execute(event);
  }
}
```

### Request Handling

#### URL Parameters

Access URL parameters using `request.urlParams`:

```typescript
async getUserById(request: RequestProps<undefined>): Promise<Response<User | string>> {
  const { urlParams } = request;
  const userId = urlParams.userId || '';
  
  if (!userId) {
    return Response.builder<string>()
      .withStatusCode(StatusType.BAD_REQUEST)
      .withBody('userId is required')
      .build();
  }
  
  // Use userId in your business logic
}
```

#### Query String Parameters

Access query parameters using `request.queryStringParams`:

```typescript
async getUsers(request: RequestProps<undefined>): Promise<Response<User[] | string>> {
  const { queryStringParams } = request;
  const { limit = '10', offset = '0', sortBy = 'name' } = queryStringParams;
  
  const users = await this.userService.getUsers({
    limit: parseInt(limit),
    offset: parseInt(offset),
    sortBy
  });
  
  return Response.builder<User[]>()
    .withStatusCode(StatusType.OK)
    .withBody(users)
    .build();
}
```

#### Request Body

Type your request body and access it via `request.body`:

```typescript
interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

async createUser(request: RequestProps<CreateUserRequest>): Promise<Response<User | string>> {
  const { body } = request;
  const { name, email, role } = body;
  
  // Validate and process the request body
  if (!name || !email) {
    return Response.builder<string>()
      .withStatusCode(StatusType.BAD_REQUEST)
      .withBody('Name and email are required')
      .build();
  }
  
  const user = await this.userService.createUser({ name, email, role });
  
  return Response.builder<User>()
    .withStatusCode(StatusType.CREATED)
    .withBody(user)
    .build();
}
```

### Response Building

Use the `Response.builder()` to construct standardized responses:

```typescript
// Success response
return Response.builder<User>()
  .withStatusCode(StatusType.OK)
  .withBody(user)
  .build();

// Error response
return Response.builder<string>()
  .withStatusCode(StatusType.BAD_REQUEST)
  .withBody('Validation error: field is required')
  .build();

// Created response
return Response.builder<User>()
  .withStatusCode(StatusType.CREATED)
  .withBody(newUser)
  .build();

// Not found response
return Response.builder<string>()
  .withStatusCode(StatusType.NOT_FOUND)
  .withBody('Resource not found')
  .build();
```

### Error Handling

Implement consistent error handling across your controllers:

```typescript
async handleRequest<T>(requestFn: () => Promise<T>): Promise<Response<T | string>> {
  try {
    const result = await requestFn();
    return Response.builder<T>()
      .withStatusCode(StatusType.OK)
      .withBody(result)
      .build();
  } catch (error) {
    console.error('Request failed:', error);
    
    if (error.name === 'ValidationError') {
      return Response.builder<string>()
        .withStatusCode(StatusType.BAD_REQUEST)
        .withBody(`Validation error: ${error.message}`)
        .build();
    }
    
    if (error.name === 'NotFoundError') {
      return Response.builder<string>()
        .withStatusCode(StatusType.NOT_FOUND)
        .withBody(error.message)
        .build();
    }
    
    return Response.builder<string>()
      .withStatusCode(StatusType.INTERNAL_SERVER_ERROR)
      .withBody('Internal server error')
      .build();
  }
}
```

## API Reference

### Unrest

The routing library itself. It can execute an APIGatewayEvent and invoke the desired controller.

### Unrest.builder()

Returns the builder for creating an instance of the unrest object.

### MethodType

Enum for HTTP methods:
- `MethodType.GET`
- `MethodType.POST`
- `MethodType.PUT`
- `MethodType.DELETE`
- `MethodType.PATCH`

### StatusType

Enum for HTTP status codes:
- `StatusType.OK` (200)
- `StatusType.CREATED` (201)
- `StatusType.BAD_REQUEST` (400)
- `StatusType.UNAUTHORIZED` (401)
- `StatusType.FORBIDDEN` (403)
- `StatusType.NOT_FOUND` (404)
- `StatusType.INTERNAL_SERVER_ERROR` (500)

### RequestProps<T>

Generic interface for request properties:
- `urlParams`: URL path parameters
- `queryStringParams`: Query string parameters
- `body`: Request body (typed as T)
- `headers`: Request headers
- `apiGatewayEvent`: Original AWS API Gateway event
- `method`: HTTP method
- `path`: Request path

### Response<T>

Generic response interface:
- `statusCode`: HTTP status code
- `body`: Response body (typed as T)

### Response.builder<T>()

Builder pattern for constructing responses:
- `.withStatusCode(code)`: Set HTTP status code
- `.withBody(data)`: Set response body
- `.build()`: Build the final response

## Performance

Unrest uses a trie data structure for efficient route matching and includes local caching to improve lookup and response times. The library is designed to minimize latency in AWS Lambda environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

