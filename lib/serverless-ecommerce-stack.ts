import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateways } from './api';
import { MyDatabase } from './database';
import { MyServices } from './microservices';

export class ServerlessEcommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new MyDatabase(this,'Database');

    const myservices = new MyServices(this, 'Microservices',{
      productTable: database.productTable
    })

    const apiGateways = new ApiGateways(this, 'Api Gateway',{
      productFunction: myservices.productMicroservice
    })

    new cdk.CfnOutput(this, 'productTablename', {
      value: database.productTable.tableName
    });
    
  }
}


// export declare class NodejsFunction extends lambda.Function {
//   constructor(scope: Construct, id: string, props?: NodejsFunctionProps);
// }