import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewaysProps{
    productFunction: IFunction,
    cartFunction: IFunction
}

export class ApiGateways extends Construct{
    constructor( scope: Construct, id: string, props: ApiGatewaysProps){
        super(scope,id);

        this.createProductApi(props.productFunction);
        this.createCartApi(props.cartFunction);
    }

    private createProductApi(productFunction:IFunction){
        const apiGateway = new LambdaRestApi(this,"productApigw",{
            handler: productFunction,
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

    private createCartApi(cartFunction:IFunction){
        // GET /cart
        // POST /cart

        // GET /cart/{username}
        // DELETE /cart/{username}

        // POST /cart/checkout

        const apigw = new LambdaRestApi(this,'cartApigw',{
            handler: cartFunction,
            proxy: false,
            restApiName: 'Cart Microservice'
        })

        const cart = apigw.root.addResource("cart");
        cart.addMethod("GET");
        cart.addMethod("POST");

        const singleCart = cart.addResource('{username}');
        singleCart.addMethod("GET");
        singleCart.addMethod("POST");
        singleCart.addMethod("DELETE");

        const cartCheckout = cart.addResource("checkout");
        cartCheckout.addMethod("POST");

    }
}

// The super keyword is used to call the constructor of its parent class to access the parent's properties and methods.
// https://www.w3schools.com/jsref/jsref_class_super.asp