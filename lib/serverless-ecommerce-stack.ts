import * as cdk from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { ApiGateways } from './api';
import { MyDatabase } from './database';
import { MyEventBus } from './eventbus';
import { MyServices } from './microservices';
import { MyQueue } from './queue';

export class ServerlessEcommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new MyDatabase(this,'Database');

    const myservices = new MyServices(this, 'Microservices',{
      productTable: database.productTable,
      cartTable: database.cartTable,
      orderTable: database.orderTable
    })

    const apiGateways = new ApiGateways(this, 'Api Gateway',{
      productFunction: myservices.productMicroservice,
      cartFunction: myservices.cartMicroservice,
      orderFunction: myservices.orderMicroservice
    })

    const queue = new MyQueue(this,'OrderQueue',{
      consumer: myservices.orderMicroservice
    })

    const eventBus = new MyEventBus(this,'CustomEventBus',{
      publisherFunction: myservices.cartMicroservice,
      //targetFunction: myservices.orderMicroservice
      targetQueue: queue.orderQueue
    })


    new cdk.CfnOutput(this, 'productTablename', {
      value: database.productTable.tableName
    });
    
  }
}


// export declare class NodejsFunction extends lambda.Function {
//   constructor(scope: Construct, id: string, props?: NodejsFunctionProps);
// }