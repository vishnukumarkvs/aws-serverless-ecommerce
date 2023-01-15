import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface MyEventBusProps{
    publisherFunction: IFunction;
    targetQueue: IQueue;
    //targetFunction: IFunction
}


export class MyEventBus extends Construct{
    constructor(scope: Construct, id: string,props: MyEventBusProps ){
        super(scope,id);

        const bus = new EventBus(this, 'EventBus',{
            eventBusName: 'MyEventBus'
          })
      
        const checkoutCartRule = new Rule(this,'CheckoutRule',{
          eventBus: bus,
          ruleName: "CheckoutCartRule",
          enabled: true,
          description: "When cart microservice checkout cart",
          // The source event should consist the below two attributes with corresponding values
          eventPattern:{
            source: ['com.vis.cart.checkoutcart'],
            detailType: ['CheckoutCart']
          }
        })
    
        // checkoutCartRule.addTarget(new LambdaFunction(props.targetFunction));
        checkoutCartRule.addTarget(new SqsQueue(props.targetQueue));

        // AccessDeniedException - not authorized to perform: events:PutEvents
        bus.grantPutEventsTo(props.publisherFunction)
    }
}