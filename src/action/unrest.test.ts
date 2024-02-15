import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unrest } from './unrest';
import { Response } from '../model/response';
import { MethodType } from '../model/methodType';
import { Request } from '../model/request';

describe('unrest', () => {
  const unrest = Unrest.builder()
    .withRoute({
      handler: () => {
        const response: Response = Response.builder()
          .withStatusCode(200)
          .withBody('success')
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.GET,
      path: '/ping',
    })
    .withRoute({
      handler: (request: Request<string>) => {
        const { body } = request;
        const response: Response = Response.builder()
          .withStatusCode(200)
          .withBody(body)
          .build();
        return Promise.resolve(response);
      },
      method: MethodType.POST,
      path: '/hello',
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
});
