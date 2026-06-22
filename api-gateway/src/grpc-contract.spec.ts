import { loadSync, type PackageDefinition } from '@grpc/proto-loader';
import { join } from 'path';
import { of } from 'rxjs';
import {
  AUTH_API_SERVICE_NAME,
  WNS_AUTH_V1_PACKAGE_NAME,
} from './generated/auth';
import {
  ACTIVITY_LOG_API_SERVICE_NAME,
  INBOUND_API_SERVICE_NAME,
  INVENTORY_API_SERVICE_NAME,
  PRODUCT_API_SERVICE_NAME,
  WAREHOUSE_API_SERVICE_NAME,
  WNS_WMS_V1_PACKAGE_NAME,
} from './generated/wms';
import { AuthService } from './auth/auth.service';
import { InboundService } from './wms/inbound/inbound.service';

interface UnaryMethodDefinition {
  requestSerialize(value: Record<string, unknown>): Buffer;
  requestDeserialize(value: Buffer): Record<string, unknown>;
  responseSerialize(value: Record<string, unknown>): Buffer;
  responseDeserialize(value: Buffer): Record<string, unknown>;
}

function getMethod(
  definition: PackageDefinition,
  serviceName: string,
  methodName: string,
): UnaryMethodDefinition {
  const service = definition[serviceName] as unknown as Record<
    string,
    UnaryMethodDefinition
  >;

  return service[methodName];
}

describe('generated gRPC contracts', () => {
  const wmsDefinition = loadSync(
    join(process.cwd(), '..', 'proto', 'wms.proto'),
    { longs: String },
  );
  const authDefinition = loadSync(
    join(process.cwd(), '..', 'proto', 'auth.proto'),
    { longs: String },
  );

  it('exports every package and service used by the gateway', () => {
    expect(WNS_AUTH_V1_PACKAGE_NAME).toBe('wns.auth.v1');
    expect(AUTH_API_SERVICE_NAME).toBe('AuthApi');
    expect(WNS_WMS_V1_PACKAGE_NAME).toBe('wns.wms.v1');
    expect([
      PRODUCT_API_SERVICE_NAME,
      WAREHOUSE_API_SERVICE_NAME,
      INBOUND_API_SERVICE_NAME,
      INVENTORY_API_SERVICE_NAME,
      ACTIVITY_LOG_API_SERVICE_NAME,
    ]).toEqual([
      'ProductApi',
      'WarehouseApi',
      'InboundApi',
      'InventoryApi',
      'ActivityLogApi',
    ]);
  });

  it('preserves presence for optional patch scalar fields', () => {
    const method = getMethod(
      wmsDefinition,
      'wns.wms.v1.ProductApi',
      'UpdateProduct',
    );
    const baseRequest = {
      productId: 'product-id',
      actorUsername: 'tester',
      actorUserId: 'user-id',
      actorRole: 'ADMIN',
    };

    const omitted = method.requestDeserialize(
      method.requestSerialize(baseRequest),
    );
    const explicitEmpty = method.requestDeserialize(
      method.requestSerialize({ ...baseRequest, description: '' }),
    );

    expect(omitted.description).toBeUndefined();
    expect(omitted).not.toHaveProperty('description');
    expect(explicitEmpty.description).toBe('');
    expect(explicitEmpty).toHaveProperty('description');
  });

  it('preserves repeated update items for omitted, empty, and populated input', () => {
    const method = getMethod(
      wmsDefinition,
      'wns.wms.v1.InboundApi',
      'UpdateInbound',
    );
    const baseRequest = {
      inboundOrderId: 'inbound-id',
      actorUsername: 'tester',
      actorUserId: 'user-id',
      actorRole: 'ADMIN',
    };
    const roundTrip = (request: Record<string, unknown>) =>
      method.requestDeserialize(method.requestSerialize(request));

    expect(roundTrip(baseRequest).items).toBeUndefined();
    expect(roundTrip({ ...baseRequest, items: [] }).items).toBeUndefined();
    expect(
      roundTrip({
        ...baseRequest,
        items: [
          {
            productId: 'product-id',
            locationId: 'location-id',
            actualQty: 2,
          },
        ],
      }).items,
    ).toEqual([
      {
        productId: 'product-id',
        locationId: 'location-id',
        actualQty: 2,
      },
    ]);
  });

  it('deserializes auth int64 values as strings', () => {
    const method = getMethod(authDefinition, 'wns.auth.v1.AuthApi', 'Login');
    const response = method.responseDeserialize(
      method.responseSerialize({
        accessToken: 'token',
        expired: '1234567890123',
      }),
    );

    expect(response.expired).toBe('1234567890123');
    expect(typeof response.expired).toBe('string');
  });

  it('keeps gateway auth and inbound mappings unchanged', async () => {
    const authClient = {
      login: jest.fn().mockReturnValue(
        of({
          accessToken: 'token',
          expired: '3600',
        }),
      ),
    };
    const authService = new AuthService({
      getService: jest.fn().mockReturnValue(authClient),
    });
    authService.onModuleInit();

    await expect(
      authService.login({ mail: 'user@example.com', password: 'secret' }),
    ).resolves.toEqual({
      access_token: 'token',
      expired: 3600,
    });

    const inboundClient = {
      updateInbound: jest.fn().mockReturnValue(of({ inbound: undefined })),
    };
    const inboundService = new InboundService(
      { getService: jest.fn().mockReturnValue(inboundClient) },
      { toHttpException: jest.fn() },
    );
    inboundService.onModuleInit();

    await inboundService.updateInbound(
      {
        user_id: 'user-id',
        username: 'tester',
        mail: 'user@example.com',
        roles: ['ADMIN'],
      },
      'inbound-id',
      {},
    );

    expect(inboundClient.updateInbound).toHaveBeenCalledWith({
      inboundOrderId: 'inbound-id',
      inboundNo: undefined,
      warehouseId: undefined,
      supplierName: undefined,
      actualDate: undefined,
      items: [],
      actorUsername: 'tester',
      actorUserId: 'user-id',
      actorRole: 'ADMIN',
    });
  });
});
