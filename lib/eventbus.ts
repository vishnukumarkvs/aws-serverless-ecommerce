import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface MyEventBusProps{
    publisherFunction: IFunction,
    targetFunction: IFunction
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
    
        checkoutCartRule.addTarget(new LambdaFunction(props.targetFunction));

        // AccessDeniedException - not authorized to perform: events:PutEvents
        bus.grantPutEventsTo(props.publisherFunction)
    }
}