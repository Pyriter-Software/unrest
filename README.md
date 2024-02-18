# Unrest

Request routing for NodeJs, written for AWS Lambda. 

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
import { Unrest, Response, StatusType } from "@pyriter/unrest";
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

const unrest = Unrest.builder()
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

// ... In the main lambda handler

async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> {
  return await unrest.execute(event);
}
```

### Additional Route Examples

You can braces `{keyName}` to define the URL params.
```typescript
const unrest = Unrest.builder()
  .withRoute({
    method: MethodType.GET,
    path: '/api/v1/ping',
    handler: pingController.getPing,
  })
  .withRoute({
    method: MethodType.POST,
    path: '/api/v1/account',
    handler: accountController.postAccount,
  })
  .withRoute({
    method: MethodType.PUT,
    path: '/api/v1/account/{accountId}',
    handler: accountController.putAccount,
  })
  .withRoute({
    method: MethodType.DELETE,
    path: '/api/v1/account/{accountId}',
    handler: accountController.deleteAccount,
  })
  .withRoute({
    method: MethodType.GET,
    path: '/api/v1/user/{userId}/order/{orderId}',
    handler: orderController.getOrderFromUser,
  })
  .build();
```


