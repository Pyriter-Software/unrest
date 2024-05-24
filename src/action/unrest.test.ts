import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unrest } from './unrest';
import { Response } from '../model/response';
import { MethodType } from '../model/methodType';
import { RequestProps } from '../model';

describe('unrest', () => {
  const unrest = Unrest.builder()
    .withRoute({
      handler: () => {
        const response = Response.builder<string>()
          .withStatusCode(200)
          .withBody('success')
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.GET,
      path: '/ping',
    })
    .withRoute({
      handler: (props: RequestProps<string>) => {
        const { body } = props.request;
        const response = Response.builder<string>()
          .withStatusCode(200)
          .withBody(body)
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.POST,
      path: '/hello',
    })
    .withRoute({
      handler: (props: RequestProps<string>) => {
        const { body } = props.request;
        const response: Response<string> = Response.builder<string>()
          .withStatusCode(200)
          .withBody(body)
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.PUT,
      path: '/hello/{id}',
    })
    .withRoute({
      handler: (
        props: RequestProps<null>,
      ): Promise<Response<TestBody>> => {
        const response = Response.builder<TestBody>()
          .withStatusCode(200)
          .withBody({
            params: props.urlParams,
            queryStringParams: props.queryStringParams,
          })
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.GET,
      path: '/hello/{id}',
    })
    .withRoute({
      handler: (
        props: RequestProps<null>,
      ): Promise<Response<TestBody>> => {
        const response = Response.builder<TestBody>()
          .withStatusCode(200)
          .withBody({
            params: props.urlParams,
            queryStringParams: props.queryStringParams,
          })
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.GET,
      path: '/foo/{id}/bar',
    })
    .withHeader({
      key: 'Access-Control-Allow-Origin',
      value: 'http://localhost',
    })
    .build();

  test('get', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/ping',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<undefined>(event);

    let responseString = JSON.stringify(response);
    expect(responseString).toEqual(
      `{"statusCode":200,"body":"success","headers":{"Access-Control-Allow-Origin":"http://localhost"}}`,
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  test('post', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/hello',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    let responseString = JSON.stringify(response);
    expect(responseString).toEqual(
      `{"statusCode":200,"body":"success","headers":{"Access-Control-Allow-Origin":"http://localhost"}}`,
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  test('put', async () => {
    const event = {
      httpMethod: 'PUT',
      path: '/hello/123',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });

  test("post to endpoint that's not valid", async () => {
    const event = {
      httpMethod: 'POST',
      path: '/hello/123',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(404);
  });

  test('get with url params', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/hello/123',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    const expectedBody = JSON.stringify({
      params: { id: '123' },
      queryStringParams: {},
    });

    expect(response).toBeDefined();
    expect(response.body).toEqual(expectedBody);
    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': 'http://localhost',
    });
    expect(response.statusCode).toEqual(200);
  });

  test('get with url params in between two', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/foo/123/bar',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    const expectedBody = JSON.stringify({
      params: { id: '123' },
      queryStringParams: {},
    });

    expect(response).toBeDefined();
    expect(response.body).toEqual(expectedBody);
    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': 'http://localhost',
    });
    expect(response.statusCode).toEqual(200);
  });

  test('get with querystring params', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/hello/myId?value1=123&value2=345',
      body: 'success',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute<string>(event);

    const expectedBody = JSON.stringify({
      params: { id: 'myId' },
      queryStringParams: {
        value1: '123',
        value2: '345',
      },
    });

    expect(response).toBeDefined();
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });
});

type TestBody = {
  params: any;
  queryStringParams: any;
};
