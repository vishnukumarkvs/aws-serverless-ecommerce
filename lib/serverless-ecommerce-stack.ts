import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class ServerlessEcommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Dynamodb Table
    const productTable = new Table(this,"ProductTable",{
      partitionKey: {name: id, type: AttributeType.STRING},
      tableName: "product",
      removalPolicy: RemovalPolicy.DESTROY, // for cdk destroy
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    const nodeJsFunctionProps: NodejsFunctionProps = {
      // bundling needs docker daemon running
      bundling:{
        externalModules:[
          'aws-sdk'
        ]
      },
      environment:{
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName
      },
      runtime: Runtime.NODEJS_14_X
    }

    // Lambda function
    // The NodejsFunction construct creates a Lambda function with automatic transpiling and bundling of TypeScript or Javascript code. This results in smaller Lambda packages that contain only the code and dependencies needed to run the function.
    // It uses esbuild under the hood.
    const productFunction = new NodejsFunction(this,"productLambdaFunction",{
      functionName: "product-function",
      entry: join(__dirname, `/../src/product/index.js`),
      ...nodeJsFunctionProps
    })

    productTable.grantReadWriteData(productFunction)

    // Api Gateway for product
    // GET /product
    // POST /product
    // DELETE /product/{id}  --> passing id as path parameter

    const apigw = new LambdaRestApi(this,"productApigw", {
      handler: productFunction,
      proxy: false,
      restApiName: 'Product Microservice'
    });

    const product = apigw.root.addResource('product');
    product.addMethod('GET');
    product.addMethod('POST');

    const singleProduct = product.addResource('{id}'); // /product/{id}
    singleProduct.addMethod('GET');
    singleProduct.addMethod('PUT');
    singleProduct.addMethod('DELETE');

  }
}
