const {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("../cart/ddbClient");

exports.handler = async function (event) {
  console.log("Ordering microservice");

  if (event.Records !== undefined) {
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html - event record reference
    await SqsInvocation(event);
  } else if (event["detail-type"] !== undefined) {
    await eventBridgeInvocation(event);
  } else {
    return await apiGatewayInvocation(event);
  }
};

const eventBridgeInvocation = async (event) => {
  console.log(`eventBridgeInvocation function: ${event}`);
  console.log(JSON.stringify(event, null, 2));

  //Normally order for doing the process to call the several microservices like invoice warehouse billing and so on.
  await createOrder(event.detail);
};

const SqsInvocation = async (event) => {
  console.log(`sqsInvocation:`, JSON.stringify(event, null, 2));

  event.Records.forEach(async (record) => {
    console.log(`Record: ${record}`);

    const cartCheckoutEventRequest = JSON.parse(record.body);

    await createOrder(cartCheckoutEventRequest.detail);
  });
};

const createOrder = async (cartCheckoutEvent) => {
  try {
    console.log(`createOrder function: ${cartCheckoutEvent}`);

    const orderDate = new Date().toISOString();
    cartCheckoutEvent.orderDate = orderDate;
    console.log(cartCheckoutEvent);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(cartCheckoutEvent || {}),
    };
    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log(createResult);
    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const apiGatewayInvocation = async (event) => {
  console.log(`api invocation: ${event}`);

  // GET /order
  // GET /order/{username}
  let body;

  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.pathParameters != null) {
          body = await getOrder(event);
        } else {
          body = await getAllOrders(event);
        }
        break;
      default:
        throw new Error(`Unsupported route: ${event.httpMethod}`);
    }
    console.log(body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully finished operation: ${event.httpMethod}`,
        body: body,
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const getOrder = async (event) => {
  console.log("getOrder");
  const username = event.pathParameters.username;
  const orderDate = event.queryStringParameters.orderDate;

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "username = :username and orderDate = :orderDate",
      ExpressionAttributeValues: {
        ":username": { S: username },
        ":orderDate": { S: orderDate },
      },
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log(Items);

    return Items.map((item) => unmarshall(item));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllOrders = async () => {
  console.log("GetAllCarts");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log(Items);

    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};
