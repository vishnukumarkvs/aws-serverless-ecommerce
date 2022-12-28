import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct, Node } from "constructs";
import { join } from "path";

interface MyServicesProps{
    productTable: ITable;
    cartTable: ITable;
}
  
export class MyServices extends Construct{

    public readonly productMicroservice: NodejsFunction;
    public readonly cartMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: MyServicesProps){
        super(scope,id);

        this.productMicroservice= this.createProductFunction(props.productTable);
        this.cartMicroservice=this.createCartFunction(props.cartTable);
    }

    // product lambda function
    private createProductFunction(productTable: ITable): NodejsFunction{
        const nodeJsFunctionProps: NodejsFunctionProps = {
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

        const productFunction = new NodejsFunction(this,'productLambdaFunction',{
            entry: join(__dirname,`/../src/product/index.js`),
            ...nodeJsFunctionProps
        })

        productTable.grantReadWriteData(productFunction);
        return productFunction;
    }

    // cart lambda function
    private createCartFunction(cartTable:ITable):NodejsFunction{
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling:{
                externalModules:[
                    'aws-sdk'
                ]
            },
            environment:{
                PRIMARY_KEY: 'username',
                DYNAMODB_TABLE_NAME: cartTable.tableName
            },
            runtime: Runtime.NODEJS_14_X
        }

        const cartFunction = new NodejsFunction(this,'cartLambdaFunction',{
            entry: join(__dirname,`/../src/cart/index.js`),
            ...nodeJsFunctionProps
        })

        cartTable.grantReadWriteData(cartFunction);
        return cartFunction;
    }
}