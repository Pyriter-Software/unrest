import { StatusType } from './statusType';

describe('StatusType', () => {
  it('should define all HTTP status codes', () => {
    expect(StatusType.OK).toBe(200);
    expect(StatusType.CREATED).toBe(201);
    expect(StatusType.BAD_REQUEST).toBe(400);
    expect(StatusType.UNAUTHORIZED).toBe(401);
    expect(StatusType.FORBIDDEN).toBe(403);
    expect(StatusType.NOT_FOUND).toBe(404);
    expect(StatusType.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it('should have correct numeric values', () => {
    const statuses = Object.values(StatusType);
    expect(statuses).toContain(200);
    expect(statuses).toContain(201);
    expect(statuses).toContain(400);
    expect(statuses).toContain(401);
    expect(statuses).toContain(403);
    expect(statuses).toContain(404);
    expect(statuses).toContain(500);
  });

  it('should have exactly 50 keys', () => {
    const statusCount = Object.keys(StatusType).length;
    expect(statusCount).toBe(50);
  });

  it('should be usable in type annotations', () => {
    const status: StatusType = StatusType.OK;
    expect(status).toBe(200);
  });

  it('should work with numeric comparisons', () => {
    const status = StatusType.CREATED;
    expect(status === 201).toBe(true);
    expect(status > 200).toBe(true);
    expect(status < 300).toBe(true);
  });

  it('should categorize status codes correctly', () => {
    // 2xx Success
    expect(StatusType.OK >= 200 && StatusType.OK < 300).toBe(true);
    expect(StatusType.CREATED >= 200 && StatusType.CREATED < 300).toBe(true);

    // 4xx Client Error
    expect(StatusType.BAD_REQUEST >= 400 && StatusType.BAD_REQUEST < 500).toBe(true);
    expect(StatusType.UNAUTHORIZED >= 400 && StatusType.UNAUTHORIZED < 500).toBe(true);
    expect(StatusType.FORBIDDEN >= 400 && StatusType.FORBIDDEN < 500).toBe(true);
    expect(StatusType.NOT_FOUND >= 400 && StatusType.NOT_FOUND < 500).toBe(true);

    // 5xx Server Error
    expect(StatusType.INTERNAL_SERVER_ERROR >= 500 && StatusType.INTERNAL_SERVER_ERROR < 600).toBe(true);
  });

  it('should work with conditional logic', () => {
    const status = StatusType.UNAUTHORIZED;
    
    if (status >= 400 && status < 500) {
      expect(status).toBe(401);
    } else {
      fail('Status should be in 4xx range');
    }
  });

  it('should work with array operations', () => {
    const statuses = [StatusType.OK, StatusType.CREATED, StatusType.BAD_REQUEST];
    expect(statuses).toContain(200);
    expect(statuses).toContain(201);
    expect(statuses).toContain(400);
    expect(statuses).toHaveLength(3);
  });

  it('should work with object property access', () => {
    const statusMap = {
      [StatusType.OK]: 'Success',
      [StatusType.CREATED]: 'Created',
      [StatusType.BAD_REQUEST]: 'Bad Request',
    };

    expect(statusMap[200]).toBe('Success');
    expect(statusMap[201]).toBe('Created');
    expect(statusMap[400]).toBe('Bad Request');
  });
});
