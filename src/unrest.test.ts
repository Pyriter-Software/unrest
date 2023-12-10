import { MethodType } from './methodType';
import { Response } from './response';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Unrest } from './unrest';

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
    .withHeader({
      key: 'Access-Control-Allow-Origin',
      value: 'http://localhost',
    })
    .build();

  test('test a simple setup', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/ping',
    } as APIGatewayProxyEvent;
    const response = await unrest.execute(event);

    expect(response).toBeDefined();
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('success');
  });
});
