# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


## REST requests
- List products
- Filter products as per categories
- CRUD products
- Add item to cart
- Checkout cart and create new order
- Delete cart

## Microservices Pattern:
- Product
  - List products
  - Filter products per categories
  - CRUD products
- Cart
  - Add item to cart
  - Delete item in cart
  - Checkout cart and create order
- Order
  - List my orders
  - Query my orders with orderDate


---

Serverless infra - AWS CDK - Cloud Development Kit
Microservices Development - AWS SDK - Software Development Kit


npm install @aws-sdk/client-dynamodb
npm install @aws-sdk/util-dynamodb

JSON.parse() is a method in JavaScript that parses a JSON string and returns a JavaScript object constructed from the JSON data. It takes a JSON string as input and returns a JavaScript object or array.
unmarshal, on the other hand, is not a built-in JavaScript function. It is a term used in the context of serialization and refers to the process of deserializing data that has been stored or transmitted in a serialized format, such as JSON or XML. In JavaScript, you can use JSON.parse() to unmarshal JSON data.

So, in summary, JSON.parse() is a specific function in JavaScript that is used to parse JSON strings and convert them into JavaScript objects, while unmarshalling refers to the general process of deserializing serialized data.

new cdk.CfnOutput(stack, 'EnvVars', {
  value: JSON.stringify(process.env, null, 2)
});

 new cdk.CfnOutput(this, 'TableName', {
      value: myTable.table.tableName
    });


    aws events put-events --entries file://checkoutcartevents.json