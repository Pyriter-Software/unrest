# Unrest


## Description 
Request routing for AWS Lambda running Nodejs, written in Typescript

Motivation: Existing routing libraries use regex to resolve routing which can be slow. This library uses a trie data structure with local caching to improve lookup and response time. (More latency data to come)

## Install

```bash
npm install @pyriter/unrest
```

## Features

1. Define routes
2. Define controllers
3. Type the request body

## Usage

### Simple HTTP GET example

```typescript
import { StatusType, Unrest } from "@pyriter/unrest";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

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

  async handle(event: APIGatewayProxyEvent):
    Promise<APIGatewayProxyStructuredResultV2> {
    return await this.unrest.execute(event);
  }
}


```

### Additional Route Examples

You can use openApi style URL params to define key value pairs like this `{keyName}`.

```typescript
const unrest = Unrest.builder()
  .withRoute({
    method: MethodType.GET,
    path: '/api/v1/ping',
    handler: pingController.getPing,
    thisReference: pingController
  })
  .withRoute({
    method: MethodType.POST,
    path: '/api/v1/account',
    handler: accountController.postAccount,
    thisReference: accountController 
  })
  .withRoute({
    method: MethodType.PUT,
    path: '/api/v1/account/{accountId}',
    handler: accountController.putAccount,
    thisReference: accountController
  })
  .withRoute({
    method: MethodType.DELETE,
    path: '/api/v1/account/{accountId}',
    handler: accountController.deleteAccount,
    thisReference: accountController
  })
  .withRoute({
    method: MethodType.GET,
    path: '/api/v1/user/{userId}/order/{orderId}',
    handler: orderController.getOrderFromUser,
    thisReference: orderController 
  })
  .build();
```
