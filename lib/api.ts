import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface ApiGatewaysProps{
    productFunction: IFunction
}

export class ApiGateways extends Construct{
    constructor( scope: Construct, id: string, props: ApiGatewaysProps){
        super(scope,id);

        const apiGateway = new LambdaRestApi(this,"productApigw",{
            handler: props.productFunction,
            proxy: false,
            restApiName: 'Product Microservice'
        })

        const product = apiGateway.root.addResource('product');
        product.addMethod('GET');
        product.addMethod('POST');

        const singleProduct = product.addResource('{id}'); // /product/{id}
        singleProduct.addMethod('GET');
        singleProduct.addMethod('PUT');
        singleProduct.addMethod('DELETE');
    }
}

// The super keyword is used to call the constructor of its parent class to access the parent's properties and methods.
// https://www.w3schools.com/jsref/jsref_class_super.asp